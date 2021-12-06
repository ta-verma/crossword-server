var data = [
    ["benkelly", 'Broke football color barrier'],
    ["mayer", "Broke football color barrier"],
    ["houstonharte", "Award winning University Center"],
    ["rambouillet", "Dominic’s breed"],
    ["frisbee", "Join this “ultimate” campus team"],
    ["softball", "Women pitched their way to World Series runner up"],
    ["bonfire", "Toastiest homecoming tradition"],
    ["texas", "Greatest state in the country"],
    ["dominic", "4-legged mascot"],
    ["black", "Original school colors: ___ & gold"],
    ["sajc", "Original initials for the school"],
    ["anglers", "Champion bass fishers"],
    ["rugby", "Back to back state champs in this intramural sport"],
    ["gumtree", "Stickiest spot on campus"],
    ["oak", "Tree lighting grove"],
    ["javelin", "2017 National champion in this track & field sport"],
    ["volleyball", "Spiked a spot in the Elite 8"],
    ["basketball", "Dribbled to Elite 8"],
    ["here", "From ___, it’s possible"],
    ["hunter", "Newest academic building: ___ Strain"],
    ["may", "April showers bring this Dr’s Flowers"],
    ["mechanical", "New engineering degree on campus in 2018"],
    ["gold", "Not silver but ___"],
    ["legrand", "Football’s home"],
    ["roscoe", "Fuzzy horned mascot"],
    ["ramjam", "Not ram jelly but ___"],
    ["bella", "She gets all women’s teams ramped up"],
    ["blue", "We are True ___"],
    ["library", "Celebrating 50 years on campus"],
    ["carr", "Oldest residence hall on campus"],
    ["archer", "New College of Health and Human Services Building"],
    ["ramfam", "Brothers & sisters, faculty & staff"],
    ["tennis", "Newest women’s sport"],
    ["mall", "Not for shopping but walking"]
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
            if (!wrd) return output(posArr)
            const next = getIdx({
                wrd,
                charIdx: charIdx
            })
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