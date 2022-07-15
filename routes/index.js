const express = require('express');
const index = express();
require('dotenv').config();
const cors = require('corss');
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
const abiFile = JSON.parse(readFileSync('./ABIs/contracts/Legi.json'));
const wbnbAbiFile = JSON.parse(readFileSync('./ABIs/abis/wbnb.json'));
const pairAbiFile = JSON.parse(readFileSync('./ABIs/abis/Pair.json'));
const factoryabi = JSON.parse(readFileSync('./ABIs/abis/factoryabi.json'));
const routerabi = JSON.parse(readFileSync('./ABIs/abis/routerabi.json'));
const abi = abiFile.abi;

const bytecode = abiFile.bytecode;
let abiJSON = [];
const adminAddy = process.env.adminAddy;
const testAddy = process.env.testAddy;
const anotherAddy = process.env.anotherAddy;
const adrianaddy = process.env.ADRIAN_ADDY;
const gavinaddy = process.env.GAVIN_ADDY;
const myseed = process.env.MY_MNEMONIC;
const providerOrUrl = "https://data-seed-prebsc-1-s1.binance.org:8545";
// const providerOrUrl = "https://ropsten.infura.io/v3/5c9601423fa3410a93e71ec7306e6ddb";

// const providerOrUrl = "http://127.0.0.1:8545";

// const wsProvider = new Web3.providers.WebsocketProvider(providerOrUrl);
// HDWalletProvider.prototype.on = wsProvider.on.bind(wsProvider)
// const wsprovider = new HDWalletProvider(phrase, wsProvider)
// const wsWeb3 = new Web3(wsprovider);
const numberOfAddresses = 10; 
// const provider = new HDWalletProvider({ mnemonic: { phrase,},providerOrUrl,numberOfAddresses});

// const web3 = new Web3( Web3.givenProvider || 'http://127.0.0.1:8545');
// const web3 = new Web3(provider || 'http://127.0.0.1:8545');

const compileContract = async ()=>{
    try{
        const etherProvider = new providers.JsonRpcProvider(providerOrUrl);
        // const signer =etherProvider.getSigner();
        const hDNode = HDNode.fromMnemonic(phrase);
        const numOfNodes = 100;
        // const walletMnemonic = new Wallet.fromMnemonic(myMnemonic);
        // const walletMnemonic = new Wallet('56d97a1a682e98616d1313f012b47bb411ccd6e52841f8d2926f1fc1c0914f3b');
        // const walletMnemonic = new Wallet( hDNode.derivePath(String(0)).privateKey );
        const walletMnemonic = new Wallet(privateKey);

        // const wallet = walletMnemonic.connect(etherProvider);
        const wallet = walletMnemonic.connect(etherProvider);

        wallet.getTransactionCount().then((res)=>{console.log(`Transaction Count: ${res}`);});
        
        const networkID = await wallet.getChainId().then((res)=>{console.log(`Id: ${res}`);});
        // console.log(`networkID: ${networkID}`)
        
        let legiInputs = {
            language: "Solidity", 
            sources: {
                'all.sol': {
                content: readFileSync('contracts/all.sol', 'utf8')
                },
                'legi.sol': {
                content: readFileSync('contracts/legi.sol', 'utf8')
                }
            },
            settings:{
                outputSelection:{
                '*': {
                    '*':['*']
                }
                }
            }
        };

        let Yaadinputs = {
            language: "Solidity", 
            sources: {
                'imports721.sol': {
                content: readFileSync('contracts/imports721.sol', 'utf8')
                },
                'yaad.sol': {
                content: readFileSync('contracts/yaad.sol', 'utf8')
                }
            },
            settings:{
                outputSelection:{
                '*': {
                    '*':['*']
                }
                }
            }
        }

        let compiledContract = JSON.parse(solc.compile(JSON.stringify(legiInputs)));

        let compiledToken = JSON.parse(solc.compile(JSON.stringify(Yaadinputs)));

        let abbi = compiledContract.contracts['legi.sol']['Legi'].abi;
        
        let bytecode = compiledContract.contracts['legi.sol']['Legi'].evm.bytecode.object;

        let tokenabi = compiledToken.contracts['yaad.sol']['Yaad'].abi;

        // writeFileSync('client/src/contracts/Yaad.json',JSON.stringify({ "contractName": "Yaad", "abi": tokenabi}));
        
        let tokenbytecode = compiledToken.contracts['yaad.sol']['Yaad'].evm.bytecode.object;

        console.log(`balance::: ${await wallet.getBalance()}`);
        
        const factory = new ContractFactory(abbi, bytecode, wallet);

        const nftFactory = new ContractFactory(tokenabi, tokenbytecode, wallet);
        
        // const contract = await factory.deploy('yaad','YD').catch((error)=>{console.log});

        const nftToken = await nftFactory.deploy('puussy','pssy').catch((error)=>{console.log});

        // await nftToken.deployed();
    
        // console.log(`${`contract address: ${contract.address}`}`);
        // console.log(`${`token address: ${nftToken.address}`}`);
        
        // contract.deployTransaction;
        await nftToken.deployTransaction.wait().catch((error)=>{console.log});
        
        // await contract.deployTransaction.wait().catch((error)=>{console.log});
        console.log(`delpoyment success: ${nftToken.address}`);
        const tokenAddy = '0x5dDebA6Ef00bD641c198174dC153767C40a6C743'
        const contract__addy = '0xcFDEb297643119cd58dB2e48BE7aBEA09B44F0D3';
        const etherTokenAddy = '0xA474eD9Cf79b9082a6682A1FC2Df6560485D76f9'
        // const token = new Contract(tokenAddy, tokenabi, wallet);
        // const contract = new Contract(contract__addy, abbi, wallet);
        
        // const token = new Contract(yaadTestNet, abbi, wallet);
        
        const etherToken = new Contract(etherTokenAddy, tokenabi, wallet);

        // await etherToken.payToMint('0xEc5DDf22F97B35C26b56ED7eCd38d998ADDB1B72', 'QmWjRCfdcpoihqB43xCBZgo1esU4yqVfPD8MG9UkfdAktT', utils.parseEther('.015'),{value:utils.parseEther('.015')}).then((res)=>{console.log(res)});

        // console.log(`my contract balance: ${await token.balanceOf(wallet.address)}`);

    }catch(error){
        console.log(`error occurred while compiling contract: ${error}`);
    }
};

// compileContract();

const ethersCreatePair = async ()=>{
    try{
        // wallet.estimateGas
        const networkID = await wallet.getChainId().then((res)=>{console.log(`Id: ${res}`);});
        // const readonlyLegiToken = new Contract(contractAddress, abi, etherProvider);
        const legitoken = new Contract(contractAddress, abi, wallet);
        // const readonlyWbnbToken = new Contract(wBNB, wbnbAbiFile, etherProvider);
        const wbnbtoken = new Contract(wBNB, wbnbAbiFile, wallet);
        // const BNB = new Contract(,,wallet);
        // const readonlyToken_Two = new Contract(token_two, abi, etherProvider);
        const token_Two = new Contract(token_two, abi, wallet);

        // const pair = await new web3.eth.Contract(pairAbiFile, pairAddy);
        let getName = await wbnbtoken.name().then((res)=>{console.log(`token name: ${res}`);}).catch((error)=>{});
        const router = new Contract(pancakeRouter,routerabi,wallet);
        const factory = new Contract(pancakeFactory,factoryabi,wallet);
        const Pair = new Contract(pairAddy, pairAbiFile, wallet);
        console.log(`wbnbtoken contract balance: ${await wbnbtoken.balanceOf(wBNB)}`);
        // await wbnbtoken.transfer(wallet.address, ethers.utils.parseUnits('1','ether'));
        console.log(`my contract balance: ${await wbnbtoken.balanceOf(wallet.address)}`);

        await wallet.getGasPrice().then((rez)=>{console.log(`${BigNumber.from(rez._hex)}`)});
        await wallet.estimateGas().then((rez)=>{console.log(`Estimate gas: ${BigNumber.from(rez._hex)}`)});
        // etherProvider.on("block", (rez)=>{console.log(`Block: ${(JSON.stringify(rez))}`)});
        await legitoken.contractEthBalance().then((rez)=>{console.log(`contract Eth Balance: ${rez}`)});
        // legitoken.on('withdrawn', (addy, balan)=>{console.log(`address: ${addy}, balance: ${balan}`)});mj
        await legitoken.approve(pancakeRouter, ethers.utils.parseEther('15'));
        await token_Two.approve(pancakeRouter, ethers.utils.parseEther('15'));
        const theWETH = await router.WETH();
        // const factoryAddy = await factory;
        // console.log(factoryAddy);
        
        const feeToSetter = await factory.feeToSetter();
        const factory_address = factory.address;
        const getpair = await factory.getPair(contractAddress, token_two);
        const allPairsLength = await factory.allPairsLength();
        // const create_pair = await factory.createPair(contractAddress, wBNB);
        // const createReceipt = await create_pair.wait();
        
        console.log(`feeToSetter: ${createReceipt.estimateGas()}, factory_address: ${factory_address}, getpair: ${getpair}, allPairsLength: ${allPairsLength}, createReceipt: ${createReceipt}`);
        // const deployed = await new ContractFactory(abi).deploy({data:bytecode}).send({from: testAddy, gas}).catch((error)=>{console.log});
    
        // const createPair = await factory.requesAccess(contractAddress, token_two);
        // console.log(`data: ${ethers.utils.parseTransaction(tx)}`);
        // ContractFactory.deploy
        // const gas
    }catch(error){
    console.log(`An error occurred: ${error}}.`);
    }
    // const pairAddy = await factory.methods.createPair(contractAddress, token_two).send({from:testAddy}).catch((error)=>{console.log(`Create pair error: ${error}`)});
    
    // setFeeTo(address _feeTo)
    // function setFeeToSetter(address _feeToSetter) external {

    // const pairAddress = await factory.getPair(contractAddress, token_two).then((res)=>{console.log(`pair address: ${res}`)}).catch((error)=>{console.log(`results: ${error}`)});
    
    
    // const feeTo = await factory.methods.setFeeToSetter(testAddy).send({from:testAddy}).then((error)=>{console.log(`fee to: ${error}`)});
    // allPairsLength
    // const lpBallance = Pair.methods.balanceOf(pairAddress);

    // const routerInstance = await router.methods.addLiquidity(contractAddress, wBNB, web3.utils.toBN(3*10**8), web3.utils.toBN(1*10**8), web3.utils.toBN(3*10**6), web3.utils.toBN(1*10**6), testAddy, web3.utils.toBN(10000000000)).send({from:testAddy}).catch((error)=>{console.log(`addLiquidity error: ${error}`)});
    // const routerInstance = await router.methods.addLiquidity(contractAddress, token_two, web3.utils.toWei('5','ether'), web3.utils.toWei('5','ether'), web3.utils.toWei('5','ether'), web3.utils.toWei('5','ether'), testAddy, web3.utils.toBN(10000000000)).send({from:testAddy}).catch((error)=>{console.log(`addLiquidity error: ${error}`)});
    // const pair = Pair.methods.at(pairAddress);
    // const balance = await Pair.methods.balanceOf(testAddy).call({from:testAddy}).catch((error)=>{console.log(error)});
    // console.log(`balance LP: ${balance}`);
    // event PairCreated(address indexed token0, address indfunction addLiquidity(
    // await legitoken.methods.transfer(gavinaddy,web3.utils.toWei('.02','ether')).send({from:testAddy}).then((err, res)=>{console.log(err)});
    
    // await factory.events.PairCreated({fromBock:0},(err,res)=>{console.log(`errors: ${(err)?err:null}, results: ${(res)?res:null}`); });

    // const pair = await Pair.at(pairAddy);
    // function createPair(address tokenA, address tokenB) external returns (address pair) {
    /*let gas = web3.eth.estimateGas({data: bytecode, from:testAddy}).then((res)=>{console.log(`gas estimmate: ${res}`);});
    let gasPrice = await web3.eth.getGasPrice().then((res)=>{console.log(`gas price: ${res}`);});
    let getBalance = legitoken.methods.balanceOf(adminAddy).call().then((res)=>{console.log(`admin token balance: ${res}`)});
    let testBalance = await legitoken.methods.balanceOf(testAddy).call().then((res)=>{console.log(`testAddy token balance: ${res}`);});
    let totalSupply = await legitoken.methods.totalSupply().call().then((res)=>{console.log(`total supply: ${res}`);});
    let contractBalance = await legitoken.methods.balanceOf(contractAddress).call().then((res)=>{console.log(`contract token balance: ${res}`);});
    let etherBalance = legitoken.methods.getEtherBalance(testAddy).call().then((res)=>{console.log(`amount of ether: ${res}`);});
    */
};
// ethersCreatePair();
const clientUri = 'https://yaadlabs.herokuapp.com/'
/* GET home page. */
index.get('/', (req, res, next)=>{
    
    res.json({ message: 'De-Bet'});

});

let upldDir = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging')?'client/build/uploads':'client/public/uploads';

index.post('/upldSingle',(req,res, next)=>{
    try {

        checkDirectory(upldDir);
        
        const storage = multer.diskStorage({

            destination: function (req, file, cb) {
                cb(null, upldDir)
            },

            filename: function (req, file, cb) {
                cb(null, (file.originalname))
            }

        });

        const upload = multer({

            storage: storage,

            limits: { fileSize: 10**9},
            
            fileFilter(req, file, cb) {
                
                if (!file.originalname.toLowerCase().match(/\.(png|jpg|jpeg|ico|gif|mp3|mp4|svg|mov|webp|webm|mpg|avi|ogg|wmv|bmp|tiff)$/)){
                
                    cb(new Error('Please upload an image.'));
                
                }
                
                cb(undefined, true)
            
            }
        
        }).single('single_asset');

        upload(req, res, (err)=>{
            // console.log(`req.body: ${JSON.stringify(req.file)}`)

            let myFile = req.file;
            const myfilePath = myFile.path;
            const pathArray = myFile.path.split(sep);
            const lastPart = pathArray.length-1;
            const fileStaticPath = pathArray[lastPart-1]+sep+pathArray[lastPart]
            
            // console.log(`resolve which paaaat: ${fileStaticPath}`);

            const readableStreamForFile = dirname(myFile.path);
            const folder = basename(dirname(myFile.path))
            const filename = myFile.originalname;

            if(req.body.name && req.body.name != filename && existsSync(normalize(upldDir+'/'+req.body.name))){
                
                console.log(`go getter!! ${req.body.name}|| ${filename}`);
                unlinkSync(normalize(upldDir+'/'+req.body.name));
            
            }
            // console.log(`the path:::: ${basename(dirname(myFile.path))}`);
            
            // console.log(`::::::::${JSON.stringify(folder)}`);

            return res.json({message:"Uloaded an NFT", folder,filename,path: fileStaticPath});
        })    
    } catch (error) {
        // console.log(`thisssssssssssssssssss: ${error}`);
        return res.json({error});
    }
});

index.post('/createone', multer().none(), (req,res, next)=>{
  
    try {

        const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
        
        pinata.testAuthentication().then((result) => {
            
            //handle successful authentication here
            console.log(result);
            
        }).catch((err) => {
            
            //handle error here
            console.log(err);
            
        });

        let NFTname = req.body.name;
        
        let desc = req.body.desc;
        
        let responseData = null;

        const options = {
            pinataMetadata:{
                name: NFTname,
                keyvalues: {
                    description: desc,
                    name: NFTname
                }
            },
            pinataOptions: {
                cidVersion: 0
            }
        };

        let body = {
            "description": desc, 
            "external_url": "", 
            "image": "", 
            "name": NFTname,
            "attributes": []
        }

        let filePath = normalize(upldDir+'/'+req.body.filename);

        pinata.pinFromFS(filePath, options).then((result) => {
                    
            unlinkSync(filePath);
            
            console.log(`img data:: ${JSON.stringify(result)}`);

            if(result.isDuplicate == true){

                return res.json({error: {message: "duplicate"}, nftDetails:body, link: result.IpfsHash});
            
            }

            body.image = result.IpfsHash;

            pinata.pinJSONToIPFS(body, options).then((rez) => {
                //handle results here
                console.log(`metadata:: ${JSON.stringify(rez)}`);
                // responseData = rez;
                return res.json({message:"uploaded", nftDetails:body, results:rez});
            }).catch((err) => {
                
                return res.json({error: {message: "Failed to save asset metadata, try reloading page. If problem persist email dev team: jasonlegister@gmail.com"}});
            });

        }).catch((err) => {
        
            return res.json({error: {message: "Failed to upload nft."}});
        });
        
    } catch (error) {
        return res.json({error: {message: "An error occurred: "+error}});
    }
});

index.post('/addGenlayer',(req,res, next)=>{
    try {
        
        checkDirectory(upldDir);
        const storage = multer.diskStorage({

            destination: function (req, file, cb) {
                // console.log(`req.body:`);
                // console.log(req.body.layerName);
                // console.log(`req.coll_name:`);
                // console.log(req.body.coll_name);
                // console.log(`req.account:`);
                // console.log(req.body.account);
                // let folderz = file.originalname.split("_");
                let dafolder = upldDir+sep+req.body.account+sep+req.body.coll_name+sep+"layers"+sep+req.body.layerName;

                // checkDirectory(dafolder);
                cb(null, upldDir);
            },

            filename: function (req, file, cb) {
                cb(null, (file.originalname))
            }

        });

        const upload = multer({

            storage: storage,

            limits: { fileSize: 10**9},
            
            fileFilter(req, file, cb) {
                
                if (!file.originalname.toLowerCase().match(/\.(png|jpg|jpeg|ico|gif|mp3|mp4|svg|mov|webp|webm|mpg|avi|ogg|wmv|bmp|tiff)$/)){
                
                    cb(new Error('Please upload an image.'));
                
                }
                
                cb(undefined, true)
            
            }
        
        }).array("files")

        upload(req, res, (err)=>{
            // console.log(`req.files: ${JSON.stringify(req.files)}`);
            // console.log(`req.body: ${JSON.stringify(req.body)}`);

            let myFiles = req.files;
            let datat = req.body;
            const address =(req.body.account)?req.body.account:null;
            const coll_name = (req.body.coll_name)?req.body.coll_name:null;
            const layer_name = (req.body.layerName)?req.body.layerName:null;

            let dataArray = []; let r = 0;
            
            while(r < myFiles.length){
                
                let clientPath = "uploads/"+myFiles[r].originalname;

                dataArray.push({trait_name: r, path: clientPath});
                
                r++;
            
            }
            // console.log(`dataArray: ${JSON.stringify(dataArray)}`);
            if(req.body.background){

                return res.json({message:"Uloaded backgrounds", response:{address,coll_name, layer_name, backgrounds:myFiles.length, data:dataArray}});

            }

            return res.json({message:"Uloaded an NFT", response:{address,coll_name, layer_name, data:dataArray}});
        })    
    } catch (error) {
        console.log(`thisssssssssssssssssss: ${error}`);
        return res.json({error,});
    }
});

index.post('/readcontracts',(req,res, next)=>{
    try {
        
        checkDirectory(upldDir);
        const storage = multer.diskStorage({

            destination: function (req, file, cb) {
                
                // checkDirectory(dafolder);
                cb(null, upldDir);
            },

            filename: function (req, file, cb) {
                cb(null, (file.originalname))
            }

        });

        const upload = multer({

            storage: storage,

            limits: { fileSize: 10**9},
            
            fileFilter(req, file, cb) {
                
                if (!file.originalname.toLowerCase().match(/\.(sol)$/)){
                
                cb(new Error('Please upload a solidity file.'));
                
                }
                
                cb(undefined, true)
            
            }
        
        }).array("files")

        upload(req, res, (err)=>{
            // console.log(`req.files: ${JSON.stringify(req.files)}`);
            // console.log(`req.body: ${JSON.stringify(req.body)}`);

            let myFiles = req.files;
            let datat = req.body;
            const address =(req.body.account)?req.body.account:null;
            const coll_name = (req.body.coll_name)?req.body.coll_name:null;

            let dataArray = []; let r = 0;
            
            while(r < myFiles.length){
                
                let clientPath = "uploads/"+myFiles[r].originalname;

                dataArray.push({trait_name: r, path: clientPath});
                
                r++;
            
            }
            // console.log(`dataArray: ${JSON.stringify(dataArray)}`);
            if(req.body.background){

                return res.json({message:"Uloaded backgrounds", response:{address,coll_name, layer_name, backgrounds:myFiles.length, data:dataArray}});

            }

            return res.json({message:"Uloaded an NFT", response:{address,coll_name, layer_name, data:dataArray}});
        })    
    } catch (error) {
        console.log(`thisssssssssssssssssss: ${error}`);
        return res.json({error,});
    }
});

index.post('/delLayer', multer().none(), (req,res, next)=>{
    try {
        
        checkDirectory(upldDir);
        
        const address =(req.body.account)?req.body.account:null;
        const layer = JSON.parse(req.body.values);
        const indx = req.body.index;
        
        console.log(`index:: ${indx}, address: ${address}, layer data: ${layer.name}`);
        let delDir = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging')?'client/build/':'client/public/';

        for (let n = 0; n < layer.traits.length; n++){
            const dapath = layer.traits[n].path;
            console.log(`path ${n})${delDir}${dapath}`);
            unlinkSync(normalize(delDir+dapath));

        }
        // const layer_name = (req.body.layerName)?req.body.layerName:null;
        return res.json({message:"deleted layer", response:{address,}});

    } catch (error) {
        console.log(`thisssssssssssssssssss: ${error}`);
        return res.json({error,});
    }
});

index.post('/delTrait', multer().none(), (req,res, next)=>{
    try {
        
        checkDirectory(upldDir);
        
        const address =(req.body.account)?req.body.account:null;
        const trait = JSON.parse(req.body.value);
        const indx = req.body.index;
        
        let delDir = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging')?'client/build/':'client/public/';

        const dapath = trait[0].path;
        // console.log(`path ${n})${delDir}${dapath}`);
        unlinkSync(normalize(delDir+dapath));
        
        // const layer_name = (req.body.layerName)?req.body.layerName:null;
        return res.json({message:"deleted layer", response:{address,}});

    } catch (error) {
        console.log(`thisssssssssssssssssss: ${error}`);
        return res.json({error,});
    }
});

let theDir = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging')?'client'+sep+'build':'client'+sep+'public';

const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
    
pinata.testAuthentication().then((result) => {
    
    //handle successful authentication here
    console.log(result);

}).catch((err) => {
    
    //handle error here
    console.log(err);

});

function shuffle(arra1) {
  var ctr = arra1.length, temp, index;

  // While there are elements in the array
  while (ctr > 0) {
      // Pick a random index
      index = Math.floor(Math.random() * ctr);
      // Decrease ctr by 1
      ctr--;
      // And swap the last element with it
      temp = arra1[ctr];
      arra1[ctr] = arra1[index];
      arra1[index] = temp;
  }
  return arra1;
}

const getCases = (input, output, n, da_path)=>{

    da_path = (da_path === null || da_path === undefined)? []: da_path;

    n = (n === null || n === undefined)? 0:n;

    if(n < input.length){

        // console.log(`running in the loop!`);
        let current_item = input[n];
        let gogo = 0;
        
        while(gogo < current_item.length){
            // console.log(`running in the loop!`);
            let val = current_item[gogo];

            da_path.push(val);
            // console.log(`testerr!!!! n: ${n}, gogo:${gogo}`);
            getCases(input, output, n+1, da_path);
            // console.log(`da_path before: ${JSON.stringify(da_path)}\n\n`);
            da_path.pop();
            // console.log(`da_path after: ${JSON.stringify(da_path)}`);
            gogo++;

        }

    }else{

        output.push(da_path.slice());

    }

};

let pinnit = async (pathh, options)=>{
    try {
        // let pookie = ( typeof(pathh) === 'object' )? await pinata.pinJSONToIPFS( pathh, options ) : await pinata.pinFromFS( pathh , options);
        if( typeof(pathh) !== 'object' ){
            let pookie = await pinata.pinFromFS( pathh , options);
            unlinkSync( pathh );
            return pookie        
        }else{
            let pookie = await pinata.pinJSONToIPFS( pathh, options );
            return pookie;
        }
    
    } catch (error) {
        
        return {error,}
    
    }
};

const drawimage = async (traitTypes, width, height, cap) => {
    let sampleArray = [];
    let gateway = 'https://gateway.pinata.cloud/ipfs/';
    const canvas = createCanvas(width, height);
    // const collectionName  = req.body.coll_name;

    const ctx = canvas.getContext('2d');
    let cap_it = (cap)?cap:traitTypes.length;
    
    for(let v = 0; v < cap_it; v++){

        const  drawableTraits = traitTypes[v].filter(x=>  x.value !== 'N/A');
        
        for(let p = 0; p < drawableTraits.length; p++) {
            console.log(`index ${p}, length: ${traitTypes.length}`);
            let  val = drawableTraits[p];

            // console.log(`traits ${JSON.stringify(drawableTraits[p])}`);

            let  image = await loadImage(gateway+val.value);

            ctx.drawImage(image, 0, 0, width, height);
        }
        
        try {
            const options = {
                pinataMetadata:{
                    name: `${v}`,
                    keyvalues: {
                    description: 'no',
                    name: `${v}`
                    }
                },
                pinataOptions: {
                    cidVersion: 0
                }
            };

            console.log(`storage path: ${upldDir}/${v}.png`);

            writeFileSync(`${upldDir}/${v}.png`, canvas.toBuffer("image/png"));
            
            let pinned = await pinnit(`${upldDir}/${v}.png` , options);
            
            let metadataJSON = { name: `sample turd #${v}`, attributes: drawableTraits, path: pinned.IpfsHash};
            
            sampleArray.push(metadataJSON);

        } catch (error) {
            return {error,};
        }

    }
    
    return sampleArray;
  
};

let loopNpin = async (req,res, next)=>{
    let collName = JSON.parse(req.body.data).coll_name;
    let layers = JSON.parse(req.body.data).layers;
    // let backgrounds = JSON.parse(req.body.data).background;
    let emptyComboArray = [];
    // background
    layers.reverse();

    for(let indx = 0; indx < layers.length; indx++){

        emptyComboArray.push({name: layers[indx].name, traits:[]});
        
        for(let pin = 0; pin < layers[indx].traits.length; pin++){

            const options = {
                pinataMetadata:{
                name: `${layers[indx].traits[pin].trait_name}`,
                keyvalues: {
                    description: `nft trait element from collection, generated by Yaad labs.`,
                    name: layers[indx].traits[pin].trait_name
                }
                },
                pinataOptions: {
                    cidVersion: 0
                }
                
            };
            
            // loctn = (datat.layers[indx].traits[pin].trait_name)? normalize(theDir+sep+datat.layers[indx].traits[pin].path): normalize(theDir+sep+datat.layers[indx].traits[pin]);
            
            let body = {
                "description": `nft trait element from ${collName} collection. generated by Yaad labs.`,
                "external_url": "", 
                "image": "", 
                "name": (layers[indx].traits[pin].trait_name)? layers[indx].traits[pin].trait_name: layers[indx].name,
                "attributes": []
            }


            let pinned = await pinnit(normalize(theDir+sep+layers[indx].traits[pin].path), options);

            emptyComboArray[indx].traits.push({ trait_name: layers[indx].traits[pin].trait_name, path: pinned.IpfsHash });
        }
    }

    // for(let f = 0; f < backgrounds.length; f++){
    //     const options = {
    //         pinataMetadata:{
    //         name: `${backgrounds[f].trait_name}.`,
    //         keyvalues: {
    //             description: `nft trait element from collection, generated by Yaad labs.`,
    //         }
    //         },
    //         pinataOptions: {
    //             cidVersion: 0
    //         }
            
    //     };

    //     let pinned = await pinnit(normalize(theDir+sep+backgrounds[f].path), options);
        
    //     backgrounds[f].path = pinned.IpfsHash;
        
    // }
    console.log(`loop n`);

    
    res.locals.comboz = emptyComboArray;
    // res.locals.backgrounds = backgrounds;
    
    return next();
    
};

let loopNpinBackground = async (req,res, next)=>{
    
    let backgrounds = JSON.parse(req.body.data).background;
    
    for(let f = 0; f < backgrounds.length; f++){
        const options = {
            pinataMetadata:{
            name: `${backgrounds[f].trait_name}.`,
            keyvalues: {
                description: `nft trait element from collection, generated by Yaad labs.`,
            }
            },
            pinataOptions: {
                cidVersion: 0
            }
            
        };

        let pinned = await pinnit(normalize(theDir+sep+backgrounds[f].path), options);
        
        backgrounds[f].path = pinned.IpfsHash;
        
    }
    // console.log(`loop n bg`);
    
    res.locals.backgrounds = backgrounds;
    
    return next();
    
}

const mapTraitTypes = async (req,res, next) => {
    let comboz = res.locals.comboz;

    let len = 0; let traitTypes = []; let ego;

    while(len < comboz.length){
        // console.log(`comboz:::::::>> ${JSON.stringify(comboz)}\n`);

        ego = comboz[len].traits.map((x,v,arr) => {
            return { trait_type: comboz[len].name, trait_name: comboz[len].traits[v].trait_name, value: x.path};
        });

        traitTypes.push(ego)

        len++;
    }
    
    res.locals.traitTypes = traitTypes;

    ego = "";
    // console.log(`mapt traits`);

    
    return next();
};

const traitTypesPushNA = async (req,res, next) => {

    let traitTypes = res.locals.traitTypes;
    let endo = 0;
    while (endo < traitTypes.length) {
        
        // if (traitTypes[endo][0].trait_type === "face" || traitTypes[endo][0].trait_type === "body") {
            // endo++;
        // }else{
            traitTypes[endo].push({trait_type: traitTypes[endo][0].trait_type, value: 'N/A'});
            endo++;
        // }
    }
    
    res.locals.traitTypes = traitTypes;
    traitTypes = "";
    return next();
};

const getAllPossibleCombos = async (req, res, next)=> {
    
    let comboz = [];
    
    getCases(res.locals.traitTypes, comboz);
    // console.log(`all possible combos: ${res.locals.comboz}`);
    
    // res.locals.traitTypes = "";
    res.locals.comboz = comboz;
    return next();

};

const shuffleCombo = async (req, res, next)=>{
    let comboz = res.locals.comboz

    await shuffle(comboz);

    res.locals.comboz = comboz;
    return next();
};

const insertBackground = async (req, res, next) =>{
    let d = 0;
    // let comboz = res.locals.comboz;
    
    while(d < res.locals.comboz.length){

        let newBG = res.locals.backgrounds[Math.floor(Math.random() * res.locals.backgrounds.length)]
        
        res.locals.comboz[d].splice(0, 0, { trait_type: "background", trait_name: newBG.trait_name, value: newBG.path });
        
        d++;
    }
    // console.log(`insert BGs`);

    return next();
};

const pinTheJSON = async (req, res, next)=>{
    let collectionName = JSON.parse(req.body.data).coll_name;
    
    let optns = {
        pinataMetadata:{
        name: collectionName,
        keyvalues: {}
        },
        pinataOptions: {
            cidVersion: 0
        }
    };

    let pinjson = await pinnit(res.locals.comboz, optns);
    res.locals.pinnedRes = pinjson;

    res.locals.possibleCombos = res.locals.comboz.length;

    console.log(`length is : ${res.locals.comboz.length}`);

    return next();
};

const getSamplesAndClearComboData = async (req, res, next)=>{
    const cap = 5;
    let cap_it = (cap)?cap:res.locals.comboz.length;
    let sampleImgs = [];
    for(let v = 0; v < cap_it; v++){
        sampleImgs.push(res.locals.comboz[v])
    }

    res.locals.comboz = sampleImgs;
    return next()
};

const updateDB = async (req, res, next)=>{
    const datat = JSON.parse(req.body.data)
    const collectionName = datat.coll_name;
    const account = req.body.account;
    

    (async function(){
        const uri = process.env.MONGO_DB_URI;
        let db; const dbname = 'yaad'; 
        let client;

        
        try{
            client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            const connected = await client.connect();
            db = connected.db('yaad');
            
            const nftcoll = db.collection('nfts');

            await nftcoll.updateOne(
                { "name": collectionName }, 
                { $set: 
                    {
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
                    }
                }, 
                { upsert: true }
            );

        }catch(err){
            console.log(err.stack);
        }
        
    })()
    return next();
};

const generate = async (req,res, next) => {
    
    const cap = 5;
    let cap_it = (cap)?cap:traitTypes.length;
    let comboz = res.locals.comboz;
    let bg = res.locals.backgrounds;
    const account = req.body.account;
    let datat = JSON.parse(req.body.data);
    let sampleImgs = [];
    const collectionName = req.body.coll_name;
    let len = 0; let traitTypes = res.locals.traitTypes; let ego; let endo = 0;

    // console.log(`comboz length::: ${comboz.length}\n`);

    // while(len < comboz.length){
    //     // console.log(`comboz:::::::>> ${JSON.stringify(comboz)}\n`);

    //     ego = comboz[len].traits.map((x,v,arr) => {
    //         return {trait_type: comboz[len].name, trait_name: comboz[len].traits[v].trait_name, value: x.path};
    //     });

    //     traitTypes.push(ego)

    //     len++;
    // }
  
  // console.log(`traittype:::::::::>>>>>>>>  ${JSON.stringify(traitTypes)}`);

    // while (endo < traitTypes.length) {
        
    //     // if (traitTypes[endo][0].trait_type === "face" || traitTypes[endo][0].trait_type === "body") {
    //         // endo++;
    //     // }else{
    //         traitTypes[endo].push({trait_type: traitTypes[endo][0].trait_type, value: 'N/A'});
    //         endo++;
    //     // }
    // }
  
    let combinations = [];
    
    // getCases(traitTypes, combinations);

    // console.log(`combo lenght::: ${combinations.length}\n`);

    // await shuffle(combinations);

    // shuffle(combinations);
    // let possibleCombos = combinations.length;
    
    // const options = {
    //     pinataMetadata:{
    //     name: collectionName,
    //     keyvalues: {}
    //     },
    //     pinataOptions: {
    //         cidVersion: 0
    //     }
    // };
  
    let d = 0;
    
    // while(d < combinations.length){
    //     let newBG = bg[Math.floor(Math.random() * bg.length)]
    //     combinations[d].splice(0, 0, { trait_type: "background", trait_name: newBG.trait_name, value: newBG.path });
    //     d++;
    // }

    // let pinjson = await pinnit(combinations, options);

    const uri = process.env.MONGO_DB_URI;
    // console.log(`results: ${JSON.stringify(rez)}`);
    // for(let v = 0; v < cap_it; v++){
    //     sampleImgs.push(combinations[cap_it])
    // }

    // res.locals.comboz = sampleImgs;
    // res.locals.traitTypes = traitTypes;
    // res.locals.possibleCombos = possibleCombos;
    res.locals.backgrounds = "";

    (async function(){
        let db;
        const dbname = 'yaad';
        let client;
        try{
            client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            const connected = await client.connect();
            db = connected.db('yaad');
            
            const nftcoll = db.collection('nfts');

            await nftcoll.updateOne(
                { "name": collectionName }, 
                { $set: 
                    {
                        "name": collectionName,
                        "uri": res.locals.pinnedRes.IpfsHash,
                        "owner": account,
                        "status": {
                            "pending": true,
                            "data": datat,
                            "samples": res.locals.comboz,
                            "samplesGenerated" : 0,
                            "state": req.body.currentState,
                            "workState": "generated"
                        }
                    }
                }, 
                { upsert: true }
            );

        }catch(err){
            console.log(err.stack);
        }
        
    })()

    return next();
};

const corsOptions = {
    "origin": 'https://yaadlabs.com',
    "methods": "GET, HEAD, PUT, PATCH, POST, DELETE",
    "preflightContinue": true,
    "optionsSuccessStatus": 200
}

index.post('/generate',cors(corsOptions), multer().none(), loopNpin, loopNpinBackground, mapTraitTypes, traitTypesPushNA, getAllPossibleCombos, shuffleCombo, insertBackground, pinTheJSON, getSamplesAndClearComboData, updateDB, (req,res, next)=>{
    try {
        let datat = JSON.parse(req.body.data);
        const account = req.body.account;
        const collectionName = datat.coll_name;
        const currentState = req.body.currentState;
        // let sampleArray = [];
        let gateway = 'https://gateway.pinata.cloud/ipfs/'; //'https://gateway.pinata.cloud/ipfs/';//'https://ipfs.io/ipfs/'

        let stateCodes = {}; let comboz = []; const priorities = []; let bb = 0;

        // while(bb < datat.layers.length){

        //   priorities.push(datat.layers[bb].name);

        //   bb++;
            
        // }

        let layerswapexception = [];
        let exception_json = {
            value:null,
            layer_name:null,
            index: null,
            layer_to_swap: null
        }
    
        drawimage(res.locals.comboz, 1000, 1000, 4).then((samplez) => {
            
            // if(res.headersSent){
            //     next();
            // }

            if (samplez.error) {
                return res.json({ error: samplez.error });
            } else {
                (async function(){
                    const uri = process.env.MONGO_DB_URI;
                    let db; 
                    let client;
            
                    
                    try{
                        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                        const connected = await client.connect();
                        db = connected.db('yaad');
                        
                        const nftcoll = db.collection('nfts');
            
                        await nftcoll.updateOne(
                            { "name": collectionName, "owner": account}, 
                            { $set: 
                                {
                                    "data.samples": samplez,
                                    "data.samplesGenerated" : 4,
                                    "data.workState": "samples"
                                }
                            }
                        );
            
                    }catch(err){
                        console.log(err.stack);
                    }
                    
                })()
                
                return res.json( { message: "success!", code: 7, sampleArray: samplez, possibleCombos: res.locals.possibleCombos, traitTypes: res.locals.traitTypes, } );
            }
        });

    } catch (error) {

        // console.log(`money shot error: ${error}`);
        return res.json({error,});

    }
});

// index.post('/drawSamples', multer().none(), loopNpin, generate, (req,res, next)=>{
//     try {
//         let datat = JSON.parse(req.body.data);
//         const account = req.body.account;
//         const collectionName = datat.coll_name;
//         const currentState = req.body.currentState;
//         // let sampleArray = [];
//         let gateway = 'https://gateway.pinata.cloud/ipfs/'; //'https://gateway.pinata.cloud/ipfs/';//'https://ipfs.io/ipfs/'

//         let stateCodes = {}; let comboz = []; const priorities = []; let bb = 0;
    
//         drawimage(res.locals.comboz, 1000, 1000).then((samplez) => {

//             const uri = process.env.MONGO_DB_URI;

//             (async function () {

//                 let db; let client; const dbname = "yaad";
                
//                 try {
                    
//                     client = new MongoClient( uri, { useNewUrlParser: true, useUnifiedTopology: true } );
//                     const connected = await client.connect();
//                     db = connected.db("yaad");
//                     const userColl = db.collection("users");
//                     let insertThis = { account, collectionName, currentState,  status: { deployed: false, data: { message: "success!", code: 7,  possibleCombos: res.locals.possibleCombos, sampleArray: samplez, traitTypes: res.locals.traitTypes }, state: "paywall" } };

//                     await userColl.updateOne( { account: account }, { $set: {"pending.$.PFP" : insertThis } }, { upsert: true, "arrayFilters":[{"ele.collectionName": collectionName}] } );
//                 } catch (err) {
//                     console.log(err.stack);
//                     return res.json( { error: err } );
//                 }
//             })();

//             // if(res.headersSent){
//             //     next();
//             // }

//             if (samplez.error) {
//                 return res.json({ error: samplez.error });
//             } else {
//                 return res.json( { message: "success!", code: 7, sampleArray: samplez, possibleCombos: res.locals.possibleCombos, traitTypes: res.locals.traitTypes, } );
//             }
//         });

//     } catch (error) {

//         // console.log(`money shot error: ${error}`);
//         return res.json({error,});

//     }
// });

module.exports = index;