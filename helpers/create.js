var data = [
    ["Humorous", 'What bone has a sense of humor?'],
    ["Crabapple", "What kind of apple has a short temper?"],
    ["Laughing", "Rolling on floor"],
    ["vitamin", "These minerals are vital to your health"],
    ["Telephone", "What has a ring, but no finger?"],
    ["spaceball", "What is an aliens favourite sport?"],
    ["Ghost", "Casper was a friendly one and Demi Moore made a clay pot with one."],
    ["Jelly", "Santa's abdomen shakes like a bowl full of this."],
    ["Pick", "	You can do this with your friends. You can do this with your nose. But don't do it with your friend's nose!"],
    ["Baseball", "	Where everyone wants to run home and stealing is encouraged."],
    ["Showers", "	Brings you May flowers."],
    ["Superhero", "	Special abilities and brightly colored underwear are all you need to be one of these."],
    ["Teeth", "	Consuming food would be pretty tough without these chompers."],
    ["Lemonade", "	Often sold by child entrepreneurs in the summer."],
    ["Meteor", "	A shower that lights up the sky."],
    ["Bikini", "	The itsy bitsy teeny weeny yellow polka dot variety is quite popular."],
    ["Solo", "	Surname of the pilot of the Millennium Falcon."],
    ["Lobe", "	Where jewelry pierces your head."],
    ["Reverse", "	If you blow past your destination, you'll have to throw your car into this."],
    ["Gorilla", "	These animals hang out in the mist."],
    ["Sandwich", "	Rueben and Monte Cristo are two delicious varieties of this."],
    ["Burp", "	Air that is expelled orally."],
    ["Comet", "	Describes a toilet cleaner as well as one of Santa's reindeer."],
    ["Terrible", "	Two year-old children who throw tantrums get this nickname. So did the tsar Ivan."],
    ["Waddle", "	The signature stroll of ducks and penguins."],
    ["Pregnant", "	The state of holding a person in your person."],
    ["Spine", "	This is needed both for courage and hardcover books."],
    ["Twilight", "	Between daylight and darkness when sparkling blood suckers like to come out."],
    ["BaldSpot", "	Responsible for the toupee industry."],
    ["Century", "	Longer than a decade and shorter than a millennium."],
    ["Charcoal", "	Fuels backyard get-togethers."],
    ["Smokey", "	Only you can prevent forest fires."],
    ["Doubt", "	A defendant will go free if a reasonable amount of this exists."],
    ["Japan", "	Godzilla calls this place home."],
    ["Saloon	", "This would be a good place to find Can-Can girls and drunk Cowboys."],
    ["Jingle", "	Santa's reindeer make this noise."],
    ["Tarzan", "	He prefers to travel on vines and pal around with gorillas."],
    ["Microsoft", "	This company makes billions of dollars selling Windows."],
    ["Triangle", "	A caribbean shape that makes ships disappear."],
    ["Penguins", "	Known for their natural tuxedos and marching."],
    ["Library", "	Before Google, we actually had to physically look things up in this building full of knowledge."],
    ["Lungs", "	They transfer oxygen from the atmosphere into blood."],
    ["Ravens", "	Dark, feathery, and popular in Baltimore."],
    ["Xray", "	Use this machine if you really want to see inside somone."],
    ["DeadSea", "	A morbidly-named body of water."],
    ["Wing", "	Angels and pilots earn these."],
    ["Fragile", "	Boxes marked as this should not be abused."],
    ["Hump", "By Thursday you're over this."],
    ["Juggling", "One of the few activities that involves bowling pins flying through the air."],
    ["Season", "Flavors your food and divides the year up."],
    ["Snickers", "A candy whose name is reminiscent of a small laugh."],
    ["Goose", "This creature travels in a gaggle."],
    ["Laugh", "The L in Lol"],
    ["mall", "Not for shopping but walking"],
]


const shuffled = data.sort(() => 0.5 - Math.random());
let selected = shuffled.slice(0, Math.random() * (shuffled.length - 5) + 5);

module.exports = {
    Crossword: function (data = selected) {

        var words = []
        var wordDict = {}

        data.forEach(obj => {
            // console.log(obj)
            words.push(obj[0])
            wordDict[obj[0]] = obj[1]
        });

        function grid(posArr, wrd) {
            const charIdx = charMap(posArr)
            // console.log(charIdx)
            if (!wrd) return output(posArr)
            const next = getIdx({
                wrd,
                charIdx: charIdx
            })
            // console.log(next)
            if (next.length) {
                const words = shuffleWords(next)
                const nextWord = word_list.pop()
                for (let i = 0; i < next.length; i += 1) {
                    const obj = words[i]
                    const ans = grid(posArr.concat(obj), nextWord)
                    if (ans) {
                        posArr.push(obj)
                        word_list.push(nextWord)
                        return ans
                    }
                }
                word_list.push(nextWord)
                return false
            }
            else
                return false
        }

        function shuffleWords(next) {
            for (let i = next.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                const tmp = next[i]
                next[i] = next[j]
                next[j] = tmp
            }
            return next
        }

        function charMap(posArr) {
            const result = {}
            posArr.forEach(pos_obj => {
                for (let i = 0, len = pos_obj.wrd.length; i < len; i += 1) {
                    if (!result[pos_obj.wrd[i]]) result[pos_obj.wrd[i]] = []
                    result[pos_obj.wrd[i]].push({
                        x: pos_obj.xPos + (pos_obj.across ? i : 0),
                        y: pos_obj.yPos + (pos_obj.across ? 0 : i)
                    })
                }
            })
            return result
        }

        function getIdx({ charIdx, wrd }) {
            const matrixObj = charMatrix(charIdx)
            if (!wrd) return []
            const poss = []
            const len = wrd.length
            for (let i = 0; i < len; i += 1) {
                if (!charIdx[wrd[i]]) continue
                charIdx[wrd[i]].forEach(xyObj => {
                    const xPos = xyObj.x
                    const yPos = xyObj.y
                    const across = matrixObj[yPos][xPos + 1] === undefined
                    if (across) {
                        if ((matrixObj[yPos][xPos - i - 1] !== undefined)
                            || (matrixObj[yPos][xPos - i + len] !== undefined)) return
                        for (let j = 0; j < len; j += 1) {
                            if (i === j) continue
                            if ((matrixObj[yPos - 1] && matrixObj[yPos - 1][xPos - i + j] !== undefined)
                                || (matrixObj[yPos][xPos - i + j] !== undefined)
                                || (matrixObj[yPos + 1] && matrixObj[yPos + 1][xPos - i + j] !== undefined)) return
                        }
                    } else {
                        if ((matrixObj[yPos - i - 1] && matrixObj[yPos - i - 1][xPos] !== undefined)
                            || (matrixObj[yPos - i + len] && matrixObj[yPos - i + len][xPos] !== undefined))
                            return
                        for (let j = 0; j < len; j += 1) {
                            if (i === j || matrixObj[yPos - i + j] === undefined) continue
                            if ((matrixObj[yPos - i + j][xPos - 1] !== undefined)
                                || (matrixObj[yPos - i + j][xPos] !== undefined)
                                || (matrixObj[yPos - i + j][xPos + 1] !== undefined)) return
                        }
                    }
                    poss.push({
                        wrd, xPos: xyObj.x - (across ? i : 0),
                        yPos: xyObj.y - (across ? 0 : i), across
                    })
                })
            }
            return poss
        }

        function charMatrix(charIdx) {
            const matrix = []
            Object.keys(charIdx).forEach(letter => {
                charIdx[letter].forEach(letterObj => {
                    const y = letterObj.y
                    const x = letterObj.x
                    if (!matrix[y]) matrix[y] = {}
                    matrix[y][x] = letter
                })
            })
            return matrix
        }

        function output(posArr) {
            let Tx = 0, Ty = 0
            let maxX = 0, maxY = 0
            posArr.forEach(pos_obj => {
                const wordLen = pos_obj.wrd.length
                const across = pos_obj.across
                const endX = pos_obj.xPos + wordLen * (across ? 1 : 0)
                const endY = pos_obj.yPos + wordLen * (across ? 0 : 1)
                if (endX > maxX) maxX = endX
                if (endY > maxY) maxY = endY
                if (pos_obj.xPos < Tx) Tx = pos_obj.xPos
                if (pos_obj.yPos < Ty) Ty = pos_obj.yPos
            })
            const order = words.reduce((iter, val, idx) => {
                iter[val] = idx
                return iter
            }, {})
            const locArr = posArr.map(pos_obj => {
                const result = pos_obj
                result.clue = wordDict[result.wrd]
                result.xPos -= Tx
                result.yPos -= Ty
                return result
            }).sort((a, b) => order[a.wrd] - order[b.wrd])
            const height = maxY - Ty
            const width = maxX - Tx

            const result = {
                length: height, width: width,
                location: locArr,
            }

            var wordslist = result.location;

            var resArr = [];

            for (let i = 0; i < result.location.length; i++) {
                resArr.push({
                    number: i + 1,
                    direction: wordslist[i].across ? "across" : "down",
                    row: wordslist[i].yPos + 1,
                    column: wordslist[i].xPos + 1,
                    clue: wordslist[i].clue,
                    answer: wordslist[i].wrd,
                })
            }

            return {
                length: height, width: width,
                wordLoc: resArr
            }
        }
        const word_list = sortArr(words)

        return grid([{ wrd: word_list.pop(), xPos: 0, yPos: 0, across: true }], word_list.pop())

        function sortArr(words) {
            return [...words].sort((pre, nex) => pre.length - nex.length)
        }
    }
}