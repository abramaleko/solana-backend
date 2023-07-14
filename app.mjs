import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { createTransferCheckedInstruction, getAccount, getAssociatedTokenAddress, getMint } from '@solana/spl-token';
import { TEN } from '@solana/pay';
import express from 'express';


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
   console.log(request.body);
   const accountField = request.body?.account;
   if (!accountField) throw new Error('missing account');

   const amount = request.body?.amount;
   console.log(amount);
   
   const sender = new PublicKey(accountField);

    // create spl transfer instruction
    // const splTransferIx = await createSplTransferIx(sender, connection);

    // Get the recent blockhash
    const recentBlockhash = await connection.getLatestBlockhash();

    const tr= SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: MERCHANT_WALLET,
      lamports: 1000000000, // 1sol =1,0000,000 lamports
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
      const message = 'Thank you for your purchase';

      response.status(200).send({ transaction: base64Transaction, message });


});

