const fs = require('fs')

const charState = {
    original: ['a', 'c', 'o', 'b'],
    corrupt: ["æ", "¢", "ø", "ß"]
}

let brokenInput = getData()

// Lê o arquivo JSON
function getData() {
    const fileName = 'broken-database.json'

    try {
        const data = fs.readFileSync(fileName)

        return JSON.parse(data)
    }
    catch (err) {
        console.log(`${err}`)
    }
}

// Exporta os dados para o arquivo saida.json
function saveData() {
    const output = JSON.stringify(brokenInput, null, 2)

    fs.writeFile(
        'saida.json',
        output,
        (err) => err && console.log('\n', err)
    )
}

// - Recuperação dos dados originais do banco de dados
function fixNames() {
    brokenInput.forEach(product => {
        product.name = replaceCorruptChars(product.name)
    })

    function replaceCorruptChars(name) {
        return name
            .split('')
            .map(char => {
                const corruptIndex = charState.corrupt.indexOf(char)

                if (corruptIndex === -1)
                    return char

                return charState.original[corruptIndex]
            })
            .join('')
    }
    //console.log('fixNames:', brokenInput)
}

function fixPrices() {
    brokenInput.forEach(product => {
        product.price = Number(product.price)
    })
    //console.log('fixPrices:', brokenInput)
}

function fixQuantities() {
    brokenInput.forEach(product => {
        if (product.quantity === undefined)
            product.quantity = 0
    })
    //console.log('fixQuantities:', brokenInput)
}

// - Validação
function printProductList() {
    const sortedList = [...brokenInput]
        .sort((a, b) => a.id - b.id)
        .sort((a, b) => (a.category > b.category) - (a.category < b.category)) //TRUE = 1, FALSE = 0

    console.log('\n---------------------- Lista de Produtos -----------------------')
    sortedList.map(product => {
        console.log(product.name)
    })
}

function printInventoryValue() {
    const categories = brokenInput
        .reduce((acc, product) => {
            return {
                ...acc,
                [product.category]: (product.price * product.quantity) + (acc[product.category] || 0)
            }
        }, {})

    const total = Object.values(categories).reduce((acc, category) => acc + category)

    console.log('\n-------- Valor de estoque --------')
    Object.keys(categories).map(category => {
        console.log(`${category}: R$ ${categories[category].toFixed(2)}`)
    })
    console.log(`\nTOTAL: R$ ${total.toFixed(2)}`)
}

if (brokenInput) {

    // Corrige nomes
    fixNames()

    // Corrige preços
    fixPrices()

    // Corrige quantidades
    fixQuantities()

    // Exporta um arquivo JSON com o banco corrigido
    saveData()

    // - Validação dos dados corrigidos
    // Lista de produtos ordenados por categorias em ordem alfabética e por id
    printProductList()

    // Imprime o valor total do estoque por categoria
    printInventoryValue()
}