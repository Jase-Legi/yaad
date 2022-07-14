const express = require('express');
const index = express();
require('dotenv').config();
const pinataSDK = require('@pinata/sdk');
const multer  = require('multer');
const {canvas, createCanvas, loadImage} = require("canvas");
const {basename, dirname, isAbsolute, normalize, resolve, sep} = require('path')
const {readFileSync, createReadStream, unlinkSync, existsSync, writeFileSync} = require('fs');
const {ethers, BigNumber, Contract, ContractFactory, getDefaultProvider, Signer, Wallet, utils, errors, version, VoidSigner, providers} =  require('ethers');
const solc = require('solc');
const { HDNode, defaultPath, hexlify, isHexString, getAddress, serializeTransaction, formatEther, formatUnits } = require('ethers/lib/utils');
// const { finished } = require('stream');
const { MongoClient, ServerApiVersion } = require('mongodb');
const privateKey = process.env.P_KEY;
const phrase = process.env.phraseSS;
const contractAddress = process.env.contract_address;
const token_two = process.env.TOKEN_ADDY_TWO
const pancakeFactory = process.env.TESTNET_FACTORY;
const pancakeRouter = process.env.TESTNET_ROUTER;
const wBNB = process.env.WBNB;
const pairAddy = process.env.PAIR_ADDY;
const checkDirectory = require('../utils/checkdir');
const generator = require('../utils/generator');

index.get("/generator/:addi", (req, res, next) => {

    const uri = process.env.MONGO_DB_URI;

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    /*nftSchema = {
        "name": collectionName,
        "uri": res.locals.pinnedRes.IpfsHash,
        "owner": account,
        "data": {
            "pending": true,
            "samples": res.locals.comboz,
            "samplesGenerated" : 0,
            "state": req.body.currentState,
            "workState": "generated"
        }
    };*/

    const checkStatus = async () => {
        try {
            await client.connect();
            const theDB = client.db("yaad");
            const nftcoll = theDB.collection("nfts");
            // console.log(`addd::: ${req.params["addi"]}`);
            const theStatus = await nftcoll.findOne( { "name": req.params["addi"] }, { projection: { _id: 0 } } ) ;
            return theStatus;
        }catch(error){
            return res.json({error,});
        } 
    };
    
    checkStatus().then((ress)=>{
        
        if(!ress){
            return res.json(null);
        }else{
            
            if(ress){
                // console.log(`take a piss:: yeah!${JSON.stringify(ress)}`);
                if(ress["data"]["samplesGenerated"] >= 4){
                    return res.json(ress);
                }
                return res.json(null);
            }else{
                return res.json(null);
            }
        }
    });
    
});

module.exports = index;
