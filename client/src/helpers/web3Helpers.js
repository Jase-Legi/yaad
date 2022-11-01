import { providers, Contract, utils, BigNumber, ContractFactory } from 'ethers';

let provider = null, signer = null, currentNetwork = null, oldNetwork = null;

// Chec for web 3 injected global variable 
if ( typeof window.ethereum !== 'undefined' ) {
    provider = new providers.Web3Provider( window.ethereum, 'any' );
    // Wait for network connection
    provider.on('network', (newNetwork, old_Network) => {
        currentNetwork = newNetwork;
        // When a Provider makes its initial connection, it emits a 'network'
        // event with a null oldNetwork along with the newNetwork. So, if the
        // oldNetwork exists, it represents a changing network
        if (old_Network) {
            oldNetwork = old_Network;
            console.log(`oldNetwork: ${JSON.stringify(oldNetwork)}`);
            // window.location = '/';
        }
    });

    window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
        //handle user switching accounts here, reload metamask interface or connect to new interface
        console.log(`accounts: ${JSON.stringify(accounts)}`);
    })

    signer = provider.getSigner();
}


const blockchainNetworks = [
    {
        name: 'Ethereum',
        chainType: 'EVM',
        networkParameters: {
            chainId: '0x1',
            chainName: 'homestead',
            nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
            },
            rpcUrls: ['https://mainnet.infura.io/v3/'],
            blockExplorerUrls: ['https://etherscan.io']
        },
        logo:'solidity_icon.svg'
    },
    {
        name: 'Binance',
        chainType: 'EVM',
        networkParameters: {
            chainId: '0x38',
            chainName: 'Smart Chain',
            nativeCurrency: {
                name: 'Binance Coin',
                symbol: 'BNB',
                decimals: 18
            },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ['https://bscscan.com']
        },
        logo:'bsc_2.svg'
    },
    {
        name: 'Avalanche',
        chainType: 'EVM',
        networkParameters: {
            chainId: '0xa86a',//43114,
            chainName: 'Avalanche C-Chain',
            nativeCurrency: {
                name: 'Avalanche',
                symbol: 'AVAX',
                decimals: 18
            },
            rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
            blockExplorerUrls: ['https://snowtrace.io']
        },
        logo:'avalanche.svg'
    },
    {
        name: 'Optimism',
        chainType: 'EVM',
        networkParameters: {
            chainId: '0xa',//10,
            chainName: 'Optimism',
            nativeCurrency: {
                name:'Ether',
                symbol: 'ETH',
                decimals: 18
            },
            rpcUrls: ['https://mainnet.optimism.io/', 'https://mainnet-optimism.brave.com/' ],
            blockExplorerUrls: ['https://optimistic.etherscan.io']
        },
        logo:'optimism.svg'
    },
    {
        name: 'Polygon',
        chainType: 'EVM',
        networkParameters: {
            chainId: '0x89',//137,
            chainName: 'Polygon Mainnet',
            nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
            },
            rpcUrls: ['https://polygon-rpc.com/', 'https://mainnet-polygon.brave.com/'],
            blockExplorerUrls: ['https://polygonscan.com/']
        },
        logo:'polygon.svg'
    },
    {
        name: 'Fantom',
        chainType: 'EVM',
        networkParameters: {
            chainId: '0xfa',//250,
            chainName: 'Fantom Opera',
            nativeCurrency: {
                name: 'Fantom',
                symbol: 'FTM',
                decimals: 18
            },
            rpcUrls: [ 'https://rpc.ftm.tools/' ],
            blockExplorerUrls: ['https://ftmscan.com/']
        },
        logo:'fantom.svg'
    },
    {
        name: 'Celo',
        chainType: 'EVM',
        networkParameters: {
            chainId: '0xa4ec',
            chainName: 'Celo Mainnet',
            nativeCurrency: {
                name: 'CELO',
                symbol: 'CELO',
                decimals: 18
            },
            rpcUrls: [ 'https://forno.celo.org/' ],
            blockExplorerUrls: [ 'https://explorer.celo.org' ]
        },
        logo: 'celo.svg'
    },
    {
        name: 'Goerli',
        chainType: 'EVM',
        networkParameters: {
            chainId: '0x5',
            chainName: 'Goerli',
            nativeCurrency: {
                name: 'GoerliETH',
                symbol: 'GoerliETH',
                decimals: 18
            },
            rpcUrls: ['https://goerli.infura.io/v3/'],
            blockExplorerUrls: ['https://goerli.etherscan.io']
        },
        logo:'eth_testnet.svg'
    }
]

const connectToChain = async ( chain )=>{
    if ( window.ethereum ){
        try {
            const switchChain = await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [ { chainId: chain.networkParameters.chainId } ]});
            if ( switchChain === null ){
                return true;
            }
        } catch ( switcherror ) {
            if ( switcherror.code === 4902 ) {
                try {
                    const switchChain = await window.ethereum.request({ method:'wallet_addEthereumChain', params:[ chain.networkParameters ] });
                    if ( switchChain === null ) {
                        return true;
                    }
                } catch ( addAccountError ) {
                    
                    return addAccountError;
                        
                }
            }

            return switcherror;
        }
    } else {
        return { code: 'NO_WALLET', msg:'No web3 wallet detected.' }
    }
};

const currentAddress = async ()=>{
    if ( window.ethereum ){
        try {
            const account = await window.ethereum.request( { method: 'eth_requestAccounts' } );
            return account[0];
        } catch ( error ) {
            return error;
        }
    } else {
        return { code: 'NO_WALLET', msg:'No web3 wallet detected.' }
    }
};

const walletConnected = async ( chain )=>{
    if(window.ethereum){
        try {
            console.log(`chain: ${JSON.stringify(chain)}`);
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            // Switch to selected EVM chain
            const switchChain = await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [ { chainId: chain.networkParameters.chainId } ]});
            console.log(`switched!: ${switchChain}`);
            return accounts[0];
        } catch ( switcherror ) {
            // Error code 4902 occurs when selected chain isn't present in seelcted wallet 
            if( switcherror.code === 4902 ){
                try {
                    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
                    // If chain not added, then add the chain
                    const switchChain = await window.ethereum.request({ method:'wallet_addEthereumChain', params:[ chain.networkParameters ] });
                    return accounts[0];
                } catch ( addAccountError ) {

                    // handle user rejection error
                    if ( addAccountError.code === 4001 ) {
                        
                    }

                    // Handle all other errors
                    return addAccountError;
                }
            }

            // handle user rejection error
            if ( switcherror.code === 4001 ) {

            }

            // Handle all other errors
            return switcherror;
        }
    }else{
        return window.location = 'https://metamask.app.link/send/pay-https://www.yaadlabs.com?value=1e17';
    }
};

const getGas = async ( trans )=>{
    return (trans)?trans.estimateGas():false;
};

const mintNFT = async (uri, tokenAddress, tokenAbi, signer )=>{
    let isconnected = await walletConnected();
    if(isconnected !== false){
        console.log(`uri: ${JSON.stringify(uri)}`);
        const gasNow = await getGas(signer).finally((eee)=>eee).catch((err)=>err);
        console.log(`gas:: ${gasNow}`);

        let options = { gasLimit: BigNumber.from(gasNow).add(5000000), value:utils.parseEther('.015') };
        
        try {
            const etherToken = new Contract( tokenAddress, tokenAbi, signer );

            const minted = await etherToken.payToMint(isconnected, JSON.stringify(uri), options).finally((res)=>res);
            // https://goerli.etherscan.io/tx/0x7b34252866bb39a045b04aa1ddd745f507a67f1fe2784a91a8db939e077aa9e2
            console.log(`minted::: ${JSON.stringify(minted)}`);
            return minted;
        } catch (error) {
            console.log(`mint error:: ${error}`);
            return error;
        }
    }
    // IpfsHash: 'QmZuPdu8HACXJo5LUB6MUYCs2HpWndsqaZmYBSUpUFYR4M',
    // window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
    // });
    console.log(isconnected);
    return isconnected;
}

export { currentAddress, signer, currentNetwork, oldNetwork, mintNFT, blockchainNetworks, connectToChain }