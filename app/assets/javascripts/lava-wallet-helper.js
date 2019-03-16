
const $ = require('jquery');

var web3utils = require('web3-utils')
var sigUtil = require('eth-sig-util')

import Vue from 'vue'


var _0xBitcoinABI = require('../../../contracts/_0xBitcoinToken.json')
var erc20TokenABI = require('../../../contracts/ERC20Interface.json')


const relayConfig = require('../../../relay.config').config

import TokenUtils from './token-utils'

var defaultTokenData;

var deployedContractInfo = require('../../../DeployedContractInfo.json')
var lavaWalletContract;
var _0xBitcoinContract;


export default class LavaWalletHelper {


    async collectClientTokenBalances(tokenList,userAddress)
    {
      for(var i in tokenList)
      {
        var tokenData = tokenList[i];

        console.log(tokenData)

        var tokenDecimals = tokenData.decimals; //fix


        var tokenBalance = await this.getTokenBalance(tokenData.address, userAddress);
        tokenData.wallet_balance_formatted = this.formatAmountWithDecimals(tokenBalance,tokenDecimals);

        var tokenAllowance = await this.getTokenAllowance(tokenData.address, userAddress);
        tokenData.approved_balance_formatted = this.formatAmountWithDecimals(tokenAllowance,tokenDecimals);


        var lavaTokenBalance = await this.getLavaTokenBalance(tokenData.address, userAddress);
        tokenData.lava_balance_formatted = this.formatAmountWithDecimals(lavaTokenBalance,tokenDecimals);

        //get wallet balance and get lava balance


        //clientTokenData

      }


    }

    async getLavaTokenBalance(tokenAddress,tokenOwner)
    {
      var contract = this.ethHelper.getWeb3ContractInstance(
        this.web3,
        this.lavaWalletContract.blockchain_address,
        lavaContractABI.abi
      );

          console.log('get lava token balance')

      console.log(contract)


        console.log(tokenAddress,tokenOwner)

      var lavaBalance = await new Promise(resolve => {
        contract.balanceOf(tokenAddress,tokenOwner, function(error,response){
           resolve(response.toNumber());
           })
      });

      return lavaBalance;
    }

    async getTokenBalance(tokenAddress,tokenOwner)
    {
      var contract = this.ethHelper.getWeb3ContractInstance(this.web3,tokenAddress,erc20TokenABI.abi );

      var balance = await new Promise(resolve => {
        contract.balanceOf(tokenOwner, function(error,response){
            console.log(error,response)

            resolve(response.toNumber());

           })
      });

      return balance;
    }

    async getTokenAllowance(tokenAddress,tokenOwner)
    {
      var contract = this.ethHelper.getWeb3ContractInstance(this.web3,tokenAddress,erc20TokenABI.abi );

      var wallet_address = this.lavaWalletContract.blockchain_address;

      var balance = await new Promise(resolve => {
        contract.allowance(tokenOwner, wallet_address, function(error,response){
           resolve(response.toNumber());
           })
      });

      return balance;
    }


    async getTokenDecimals(tokenAddress)
    {
      var contract = this.ethHelper.getWeb3ContractInstance(this.web3,tokenAddress,erc20TokenABI.abi );


      var decimals = await new Promise(resolve => {
        contract.decimals( function(error,response){
           resolve(response.toNumber());
           })
      });

      return decimals;
    }

    //not used
      async updateWalletRender()
      {
        if(this.web3 == null)
        {
          console.log("No web3 to load wallet data.")
          return;
        }

          console.log( 'loading wallet data ')


          var activeAccount = web3.eth.accounts[0];

          accountAddress = activeAccount;

          console.log(accountAddress)



          var contract = this.ethHelper.getWeb3ContractInstance(this.web3  );


          let getDecimals = new Promise(resolve => {
            contract.decimals( function(error,response){
               resolve(response.toNumber());
               })
          });

          let getTokenBalance = new Promise(resolve => {
            contract.balanceOf(activeAccount, function(error,response){
               resolve(response.toNumber());
               })
          });

          var decimals = await getDecimals ;
          var tokenBalance = await getTokenBalance ;

          balanceText = tokenBalance / Math.pow(10,decimals);

      }



    detectInjectedWeb3()
    {



      if (typeof web3 !== 'undefined') {
          web3 = new Web3(web3.currentProvider);

          console.log(web3)

        if(typeof web3.eth !== 'undefined' && typeof web3.eth.accounts[0] !== 'undefined')
        {

          return web3;

        }else{

            console.log(web3.eth)
              console.log('acct',web3.eth.accounts[0])


          this.alertRenderer.renderError("No Web3 interface found.  Please login to Metamask or an Ethereum enabled browser.")
        }

      } else {

        console.error("no web3 found.")
        // set the provider you want from Web3.providers
        //web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        this.alertRenderer.renderError("No Web3 interface found.  Please install Metamask or use an Ethereum enabled browser.")

      }


      return null;
    }




  async getCurrentEthBlockNumber()
  {
   return await new Promise(function (fulfilled,error) {
          web3.eth.getBlockNumber(function(err, result)
        {
          if(err){error(err);return}
          console.log('eth block number ', result )
          fulfilled(result);
          return;
        });
     });

  }



  async getEscrowBalance(token_address,user)
  {
    var contract = this.ethHelper.getWeb3ContractInstance(
      this.web3,
      lavaWalletContract.blockchain_address,
      lavaContractABI.abi
    );

    var balanceResult =  await new Promise(function (fulfilled,error) {
           contract.balanceOf.call(token_address,user,function(err,result){
             fulfilled(result);
           })
      });

      console.log('balanceResult',balanceResult.toNumber())

      return balanceResult.toNumber();
  }

  async getOrderAmountFilled(token_get,amount_get,token_give,amount_give,expires,nonce,user)
  {

    console.log('amount filledd',token_get,amount_get,token_give,amount_give,expires,nonce,user)
    var contract = this.ethHelper.getWeb3ContractInstance(
      this.web3,
      lavaWalletContract.blockchain_address,
      lavaContractABI.abi
    );


    var filledResult =  await new Promise(function (fulfilled,error) {
           contract.amountFilled.call(token_get,amount_get,token_give,amount_give,expires,nonce,user,0,0,0,function(err,result){
             fulfilled(result);
           })
      });

      console.log('filledResult',filledResult)

      return filledResult.toNumber();

  }


  async depositEther(amountFormatted,callback)
  {
     console.log('deposit ether',amountRaw);

     var amountRaw = this.getRawFromDecimalFormat(amountFormatted,18)


     var contract = this.ethHelper.getWeb3ContractInstance(
       this.web3,
       lavaWalletContract.blockchain_address,
       lavaContractABI.abi
     );

     console.log(contract)

     contract.deposit.sendTransaction(  {value: amountRaw}, callback);

  }

  async withdrawEther(amountFormatted,callback)
  {
    var amountRaw = this.getRawFromDecimalFormat(amountFormatted,18)

     var contract = this.ethHelper.getWeb3ContractInstance(
       this.web3,
       lavaWalletContract.blockchain_address,
       lavaContractABI.abi
     );

     console.log(contract)

     contract.withdraw.sendTransaction( amountRaw, callback);

  }



  //should be using approve and call!!!
  async ApproveAndCallDepositToken(tokenAddress,amountFormatted,tokenDecimals,callback)
  {
     console.log('deposit token',tokenAddress,amountRaw);

     var amountRaw = this.getRawFromDecimalFormat(amountFormatted,tokenDecimals)


     var remoteCallData = '0x01';

     var contract = this.ethHelper.getWeb3ContractInstance(
       this.web3,
       tokenAddress,
       _0xBitcoinABI.abi
     );

     console.log(contract)

     var approvedContractAddress = this.lavaWalletContract.blockchain_address;

     contract.approveAndCall.sendTransaction( approvedContractAddress, amountRaw, remoteCallData , callback);

  }


  async approveAndDepositToken(tokenAddress,amountFormatted,tokenDecimals,callback)
  {

    console.log('approve and deposit token',tokenAddress,amountRaw);

    var amountRaw = this.getRawFromDecimalFormat(amountFormatted,tokenDecimals)


    var contract = this.ethHelper.getWeb3ContractInstance(
      this.web3,
      tokenAddress ,
      _0xBitcoinABI.abi
    );

    var spender = this.lavaWalletContract.blockchain_address;

    contract.approveAndCall.sendTransaction( spender, amountRaw , 0x0 , callback);

  }


  //var actions = ["mutate","unmutate","lava transfer"]


  static async executeTokenAction(ethHelper,tokenAddress, actionName, amountFormatted, callback)
  {

      ///  var tokenData =

      var tokenData = TokenUtils.getTokenDataByAddress( tokenAddress );

      console.log('ethHelper', ethHelper)

        console.log('execute token action', actionName, tokenData)

      var tokenDecimals = tokenData.decimals;
      var amountRaw = TokenUtils.getRawFromDecimalFormat(amountFormatted,tokenDecimals)
      var tokenSymbol = tokenData.symbol;

      //var lavaReady = (tokenData.lavaReady == true)
      //var supportsDelegateCallDeposit = (tokenData.supportsDelegateCallMutate == true)

      if(tokenData.lavaReady)
      {

      }

      if(tokenData.supportsDelegateCallMutation == true)
      {

        if(actionName == 'mutate')
        {
           LavaWalletHelper.delegateCallMutateToken(ethHelper,tokenSymbol,amountRaw,callback)
        }
      }

  }


  static async approveToken(tokenAddress,amountFormatted,tokenDecimals,callback)
  {
     console.log('approve token',tokenAddress,amountRaw);

     var amountRaw = LavaWalletHelper.getRawFromDecimalFormat(amountFormatted,tokenDecimals)


     var contract =  ethHelper.getWeb3ContractInstance(
       this.web3,
       tokenAddress ,
       erc20TokenABI.abi
     );

     var spender = this.lavaWalletContract.blockchain_address;

     contract.approve.sendTransaction( spender, amountRaw , callback);

  }

  static async delegateCallMutateToken(ethHelper,tokenSymbol,amountRaw,callback)
  {
     console.log('mutate token',tokenSymbol,amountRaw);

     var tokenData = TokenUtils.getTokenDataBySymbol( tokenSymbol );
     var mutatesToToken = TokenUtils.getTokenDataBySymbol(tokenData.mutates_to)

     var contract =  ethHelper.getTokenContractInstance(tokenData);
      console.log(contract)
     /*
     var contract =  ethHelper.getWeb3ContractInstance(
       this.web3,
       this.lavaWalletContract.blockchain_address,
       lavaContractABI.abi
     );

     console.log(contract)

     var from = this.web3.eth.accounts[0];

     contract.depositTokens.sendTransaction( from, tokenAddress, amountRaw ,   callback);
    */

    var from = this.web3.eth.accounts[0];
    contract.approveAndCall.sendTransaction( from, tokenAddress, amountRaw ,   callback);


  }


  async withdrawToken(tokenAddress,amountFormatted,tokenDecimals,callback)
  {
     console.log('withdraw token',tokenAddress,amountRaw);

     var amountRaw = this.getRawFromDecimalFormat(amountFormatted,tokenDecimals)


     var contract = this.ethHelper.getWeb3ContractInstance(
       this.web3,
       this.lavaWalletContract.blockchain_address,
       lavaContractABI.abi
     );

     console.log(contract)

     contract.withdrawTokens.sendTransaction( tokenAddress, amountRaw , callback);

  }


  async generateLavaTransaction(method, tokenAddress, amountFormatted, transferRecipient, relayerRewardFormatted, tokenDecimals)
  {

    var self = this;


      var amountRaw = this.getRawFromDecimalFormat(amountFormatted,tokenDecimals)
      var relayerRewardRaw = this.getRawFromDecimalFormat(relayerRewardFormatted,tokenDecimals)


    //bytes32 sigHash = sha3("\x19Ethereum Signed Message:\n32",this, from, to, token, tokens, relayerReward, expires, nonce);
   //  address recoveredSignatureSigner = ECRecovery.recover(sigHash,signature);
   var ethBlock = await this.getCurrentEthBlockNumber();

  // var method = 'transfer'; //need a dropdown


   var walletAddress = this.lavaWalletContract.blockchain_address;
   var from = this.web3.eth.accounts[0];
   var to = transferRecipient;
   var tokenAddress = tokenAddress;
   var tokenAmount = amountRaw;
   var relayerReward = relayerRewardRaw;
   var expires = ethBlock + 1000;
   var nonce = web3utils.randomHex(16);

   //need to append everything together !! to be ..like in solidity.. :  len(message) + message

   const msgParams = LavaPacketUtils.getLavaParamsFromData(method,from,to,walletAddress,tokenAddress,tokenAmount,relayerReward,expires,nonce)


   console.log('generateLavaTransaction',tokenAddress,amountRaw,transferRecipient)


    //testing
    var sigHash = sigUtil.typedSignatureHash(msgParams);

    console.log('lava sigHash',msgParams,sigHash)



    var params = [msgParams, from]

    var signature = await this.signTypedData(params,from);



    console.log('lava signature',msgParams,signature)

    var packetJson = LavaPacketUtils.getLavaPacket(
      method,from,to,walletAddress,tokenAddress,tokenAmount,
      relayerReward,expires,nonce,signature)

      var lavaPacketString = JSON.stringify(packetJson);

      console.log('lava packet json ',  lavaPacketString );

      await  Vue.set(actionContainer, "lavaPacketExists" , true);
      await Vue.set(actionContainer, "lavaPacketData" , lavaPacketString);

      Vue.nextTick(function () {
        self.registerLavaPacketDownloadButton(lavaPacketString)
        self.registerLavaPacketBroadcastButton(lavaPacketString)
      })
  }

  async registerLavaPacketDownloadButton(lavaPacketString)
  {

      var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lavaPacketString));
      $('#btn-download-lava-packet').empty();
      $('<a href="data:' + data + '" download="packet.lava" class="button is-primary btn-download-lava-packet">Download Lava Packet</a>').appendTo('#btn-download-lava-packet');


  }

  async registerLavaPacketBroadcastButton(lavaPacketString)
  {
    var self = this;

    $('.btn-broadcast-lava-packet').on('click',function(){
        self.broadcastLavaPacket(lavaPacketString)
    })


  }



  static async initiateLavaPackTransaction(lavaPacket)
   {
     console.log('initiate', lavaPacket);
     console.log('to', lavaPacket.to);

     //DO IN ANOTHER LIB




   }



  async broadcastLavaPacket(lavaPacketString)
  {
    console.log('broadcast ',lavaPacketString, actionContainer.relayNodeURL)

    var lavaPacketData = JSON.parse(lavaPacketString)

    console.log(lavaPacketData)

    var response = await LavaPacketHelper.sendLavaPacket(actionContainer.relayNodeURL, lavaPacketData)

    if(response.success)
    {
      await  Vue.set(actionContainer, "broadcastMessage" , "Success!");
    }else{
      await  Vue.set(actionContainer, "broadcastMessage" , response.message);
    }

    /*for(var i in lavaSeedNodes.seedNodes)
    {
      var seed = lavaSeedNodes.seedNodes[i];


      $.ajax({
          url: seed.address,
          type: 'POST',
          data: {lavaPacketString:lavaPacketString}
        });

    }*/


  }


  async signTypedData(params,from)
  {
    var result = await new Promise(async resolve => {

      //personal sign using Metamask
      var method = 'eth_signTypedData'

              web3.currentProvider.sendAsync({
                method,
                params,
                from,
              }, function (err, result) {
                if (err) return console.dir(err)
                if (result.error) {
                  alert(result.error.message)
                }
                if (result.error) return console.error(result)
                console.log('PERSONAL SIGNED:' + JSON.stringify(result.result))


                  //this method needs to be in solidity!
                const recovered = sigUtil.recoverTypedSignature({ data: params[0], sig: result.result })



                  resolve(result.result)

              })


      });

      return result;
  }

/*
  async personalSign(msg,from)
  {
    var result = await new Promise(async resolve => {

      //sign(keccack256("\x19Ethereum Signed Message:\n" + len(message) + message)));
      //personal_ecRecover

        this.web3.personal.sign(msg, from, function (err, result) {
             if (err) return console.error(err)
             console.log('PERSONAL SIGNED:' + result)

             resolve(result);

           });

      });

      return result;
  }
*/
//nonce should just be a securerandom number !

  //initiated from a little form - makes a listrow
  async createOrder(tokenGet,amountGet,tokenGive,amountGive,expires,callback)
  {
     console.log('create order ',tokenGet,amountGet,tokenGive,amountGive,expires);

     var contract = this.ethHelper.getWeb3ContractInstance(
       this.web3,
       lavaWalletContract.blockchain_address,
       lavaContractABI.abi
     );

     console.log(contract)

     var nonce = web3utils.randomHex(32);

     contract.order.sendTransaction( tokenGet,amountGet,tokenGive,amountGive,expires, nonce, callback);

  }

  //initiated from clicking an order row
  async performTrade(tokenGet,amountGet,tokenGive,amountGive,expires,nonce, user, v,r,s, amount,  callback)
  {
    console.log(  'performTrade',tokenGet,amountGet,tokenGive,amountGive,expires,nonce, user, v,r,s, amount,  callback)

    var contract = this.ethHelper.getWeb3ContractInstance(
      this.web3,
      lavaWalletContract.blockchain_address,
      lavaContractABI.abi
    );

     contract.trade.sendTransaction( tokenGet,amountGet,tokenGive,amountGive,expires,nonce, user, v,r,s, amount, callback);

  }



  async cancelOrder(tokenGet,amountGet,tokenGive,amountGive,expires,nonce,  v,r,s,   callback)
  {
    console.log(  'performTrade',tokenGet,amountGet,tokenGive,amountGive,expires,nonce,  v,r,s,   callback)

    var contract = this.ethHelper.getWeb3ContractInstance(
      this.web3,
      lavaWalletContract.blockchain_address,
      lavaContractABI.abi
    );

     contract.cancelOrder.sendTransaction( tokenGet,amountGet,tokenGive,amountGive,expires,nonce,  v,r,s,  callback);

  }

  //maybe use web3 ??



}
