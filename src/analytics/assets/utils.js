const modifiers = [0.1, 1, 10, 100, 1000];

async function getLiq(amount, block, getLiqPrice) {

    let item = {};
    for (let i = 0; i < modifiers.length; i++) {
        let modifier = modifiers[i];

        let sum = amount * modifier;

        let symbol = modifier + "";
        if (modifier === 0.1)
            symbol = '01';

        let price = await getLiqPrice(sum, block);
        item['liquidationPrice_' + symbol] = price;
        item['liquidationValue_' + symbol] = price * sum;

    }

    return item;
}


module.exports = {
    getLiq: getLiq,

}
