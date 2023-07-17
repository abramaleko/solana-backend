import {Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { createTransferCheckedInstruction, getAccount, getAssociatedTokenAddress, getMint } from '@solana/spl-token';
import { TEN } from '@solana/pay';
import express from 'express';
import axios from 'axios';
const app = express();

app.use(express.json());

// API endpoints will be defined here

const port = 3000; // choose any port you prefer

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// GET endpoint
app.get('/api/merchant', (req, res) => {
  
    const label = 'Abraham Maleko (The Developer)';
    const icon = 'https://github.com/abramaleko/solana-backend/blob/main/icon.png?raw=true';
  
    res.status(200).json({
      label,
      icon,
    });
});

const MERCHANT_WALLET = new PublicKey("EmPnKvMjNLFyPTx5kau2U41JXqD9qUXKY3Qig8hvz5Ek");
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
const tokenAddress=new PublicKey("9jDpKzpHz6fatL8CiJjRhAGsLJmLMzXvynwxY5y7ykKF");


app.post('/api/merchant',async(request,response)=>{

   // Account provided in the transaction request body by the wallet.
   const accountField = request.body?.account;
   if (!accountField) throw new Error('missing account');

   //decodes the url
   const fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
   const decodedUrl = decodeURIComponent(fullUrl);
   const url = new URL(decodedUrl);
   const searchParams = new URLSearchParams(url.search);

  //  connection.requestAirdrop(sender,10000000000);  //for test purpose only

   //finds the amount, if not found throw error
   const amount = searchParams.get('amount');
   if (!amount) throw new Error('missing amount');
   
   const sender = new PublicKey(accountField);

 // create  transfer instruction
    const tokenTransferIx = await createTokenTransferIx(sender, connection,amount);

    // create the transaction
    const transaction = new Transaction();
    transaction.add(tokenTransferIx);

      // Serialize and return the unsigned transaction.
      const serializedTransaction = transaction.serialize({
        verifySignatures: false,
        requireAllSignatures: false,
      });

      const base64Transaction = serializedTransaction.toString('base64');
      const message = 'Your swaping tokens for your in-game points';

  // Create an object with the data you want to send
  const postData = {
    user_id:searchParams.get('user_id'),
    amount: amount,
    transaction_id: accountField,
  };

  try {
    // Make a POST request to the desired server
    const apiUrl = 'http://localhost/api/record-swaps'; // Replace with the actual URL
    const apiResponse = await axios.post(apiUrl, postData);

    // Handle the response from the server
    console.log(apiResponse.data);
    // Rest of your code...
  } catch (error) {
    console.error(error);
    // Handle the error...
  }

      response.status(200).send({ transaction: base64Transaction, message });

});


async function createTokenTransferIx(sender,connection,amount){
 

  // const senderInfo = await connection.getAccountInfo(sender);
  //   if (!senderInfo) throw new Error('sender not found');

    // Get the sender's ATA and check that the account exists and can send tokens
    const senderATA = await getAssociatedTokenAddress(tokenAddress, sender);
    console.log(senderATA);
    const senderAccount = await getAccount(connection, senderATA);
    console.log(senderAccount);
    if (!senderAccount.isInitialized) throw new Error('sender not initialized');
    if (senderAccount.isFrozen) throw new Error('sender frozen');

    // Get the merchant's ATA and check that the account exists and can receive tokens
    const merchantATA = await getAssociatedTokenAddress(tokenAddress, MERCHANT_WALLET);
    const merchantAccount = await getAccount(connection, merchantATA);
    if (!merchantAccount.isInitialized) throw new Error('merchant not initialized');
    if (merchantAccount.isFrozen) throw new Error('merchant frozen');

    // Check that the token provided is an initialized mint
    const mint = await getMint(connection, tokenAddress);
    if (!mint.isInitialized) throw new Error('mint not initialized');

    // You should always calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    amount = new BigNumber(amount).times(new BigNumber(TEN).pow(mint.decimals)).integerValue(BigNumber.ROUND_FLOOR);


    // Check that the sender has enough tokens
    const tokens = BigInt(String(amount));
    if (tokens > senderAccount.amount) throw new Error('insufficient funds');

    // Create an instruction to transfer SPL tokens, asserting the mint and decimals match
    const splTransferIx = createTransferCheckedInstruction(
        senderATA,
        tokenAddress,
        merchantATA,
        sender,
        tokens,
        mint.decimals
    );

    // Create a reference that is unique to each checkout session
    const references = [new Keypair().publicKey];

    // add references to the instruction
    for (const pubkey of references) {
        splTransferIx.keys.push({ pubkey, isWritable: false, isSigner: false });
    }

    return splTransferIx;
}
