
const axios = require('axios');

const web3Service = require('./web3Service');

axios.get('https://api.covalenthq.com/v1/137/events/topics/0x6997cdab3aebbbb5a28dbdf7c61a3c7e9ee2c38784bbe66b9c4e58078e3b587f/?ending-block=latest&key=ckey_3a2959d0ef4b489ea62c0473214').then(value => {

    let items = value.data.data.items;

    items.forEach((item)=>{

        console.log(item)
        let types = web3Service.exchangeJSON.abi;
        let input = types.find(value=>value.name === 'RewardEvent').inputs;
        console.log(web3Service.web3.eth.abi.decodeParameters(input, item.raw_log_data))

    })
})
