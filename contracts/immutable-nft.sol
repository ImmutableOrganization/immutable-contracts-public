// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import "@openzeppelin/contracts/utils/Strings.sol";

contract ImmutableNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable {
    using SafeMath for uint256;


    uint256 public constant MAX_MINT_PER_TX = 10;
    uint256 public constant MAX_SUPPLY = 687;
    uint256 public mintPrice = 0.00 ether;
    string public baseURI;


  constructor(string memory _name, string memory _symbol, string memory _baseURI) ERC721(_name, _symbol) {
    baseURI = _baseURI;
    mint(10);
    mint(10);
    mint(10);
    mint(3);
  }

  function mint(uint256 _n) public payable whenNotPaused {
        require(_n > 0 && _n <= MAX_MINT_PER_TX, "Invalid number of tokens to mint");
        require(totalSupply().add(_n) <= MAX_SUPPLY, 'Minting would exceed max supply');
        require(mintPrice.mul(_n)  <= msg.value, 'Insufficient payment');
        for (uint256 i = 0; i < _n; i++) {
            uint256 tokenId = totalSupply();
            if (tokenId < MAX_SUPPLY) {
               _safeMint(msg.sender, tokenId);
                setTokenURI(tokenId, Strings.toString(tokenId));
            }
        }       
  }

  function setTokenURI(uint256 tokenId, string memory tokenURI) public onlyOwner {
    require(_exists(tokenId), 'Token ID does not exist');
    _setTokenURI(tokenId, tokenURI);
  }

  function _baseURI() internal view override returns (string memory) {
    return baseURI;
  }

  function setBaseURI(string memory _baseURI) external onlyOwner {
    baseURI = _baseURI;
  }

  function setMintPrice(uint256 _mintPrice) external onlyOwner {
    mintPrice = _mintPrice;
  }

  function pause() external onlyOwner {
    _pause();
  }

  function unpause() external onlyOwner {
    _unpause();
  }

  function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
    return super.supportsInterface(interfaceId);
  }

  function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
    return super.tokenURI(tokenId);
  }

  function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
    super._burn(tokenId);
  }

  function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override(ERC721, ERC721Enumerable) whenNotPaused {
    super._beforeTokenTransfer(from, to, tokenId, batchSize);
  }

  function withdraw() external onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, 'No balance to withdraw');
    (bool success, ) = payable(owner()).call{ value: balance }('');
    require(success, 'Withdrawal failed');
  }
}
