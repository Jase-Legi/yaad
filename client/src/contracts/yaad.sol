// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./imports721.sol";

/// @custom:security-contact legidesigns@gmail.com
contract Yaad is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    
    mapping (string => uint8) mintedUris;

    constructor(string memory dname, string memory symb) ERC721(dname, symb) {}
    
    // bool internal locked;
    
    modifier reentrancyGuard (bool locked) {
        require(!locked, "nice try");
        locked = true;
        _;
        locked =false;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function safeMint(address to, string memory uri) internal {
        uint256 tokenId = _tokenIdCounter.currentggggggggg();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }
    
    function assetALreadyMinted(string memory uri) public view returns(bool){
        return mintedUris[uri] == 1; 
    }

    function payToMint(address to, string memory uri) payable public {
        require(mintedUris[uri] != 1, "NFT minted already");
        require(msg.value >= 15e19, "Requires at least .015 ether to mint.");
        // require(msg.value >= .015 ether, "Requires at least .015 ether to mint.");
        mintedUris[uri] = 1;
        safeMint(to, uri);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}

