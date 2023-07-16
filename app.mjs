import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
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

// const splToken = new PublicKey(process.env.USDC_MINT);
const MERCHANT_WALLET = new PublicKey("CVmz887tvi36wB2Jw7aYAHfenB2KJk5MHgaNV6xEjpEr");
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

app.post('/api/merchant',async(request,response)=>{

   // Account provided in the transaction request body by the wallet.
   const accountField = request.body?.account;
   if (!accountField) throw new Error('missing account');

   //decodes the url
   const fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
   const decodedUrl = decodeURIComponent(fullUrl);
   const url = new URL(decodedUrl);
   const searchParams = new URLSearchParams(url.search);

  //  connection.requestAirdrop(sender,10000000000);

   //finds the amount, if not found throw error
   const amount = searchParams.get('amount');
   if (!amount) throw new Error('missing amount');
   
   const sender = new PublicKey(accountField);

    // Get the recent blockhash
    const recentBlockhash = await connection.getLatestBlockhash();

    const tr= SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: MERCHANT_WALLET,
      lamports: amount * 1000000000 // 1sol =1,0000,000,000 lamports
    });

    // create the transaction
    const transaction = new Transaction();
    transaction.add(tr);

    const bh= await connection.getLatestBlockhash();
    transaction.recentBlockhash=bh.blockhash;
    transaction.feePayer=sender;
  
    
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

