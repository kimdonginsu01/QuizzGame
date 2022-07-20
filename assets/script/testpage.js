var url = window.location.href
var id = url.substring(url.lastIndexOf('id=') + 1)

var testApi = `http://localhost:3000/tests/${id}`

start()

async function start() {
    const test = await getQuests()
    // console.log((test));
    await renderQuests(test)
    // await handleQuestion(tests)
}

async function getQuests() {
    const response = await fetch(testApi)
    const data = await response.json()
    return data
}

async function renderQuests(test) {
    var listQuest = test.questions
    var listQuestBlock = document.querySelector('.questions-list .row')

    var htmlsQuest = listQuest.map(quest => {
        var str = []
        str += `
            <div class="question-item question_${quest.id} col l-6"  value="${quest.point}" data-set="${quest.id}">
            <h2 class="question-content">Câu hỏi ${quest.id}: ${quest.question}
                
        `
        // Render cau hoi co 1 cau tra loi
        if (quest.correctAnswers.length < 2){
            str += `<span class="question-option">(Chọn 1 đáp án)</span>
                    <span class="question-score">${quest.point} pt</span>
            </h2>`
            quest.answers.forEach(ans => {
                str += `
                    <input style="display: none" type="radio" id="answer_${ans.id}" name="question_${quest.id}" value="${ans.id}">
                    <label style="display: block" for="answer_${ans.id}" class="answer-item answer_${ans.id}">${ans.content}</label>
                `
            })
        } 
        // Render cau hoi co nhieu cau tra loi
        else {
            str += `<span class="question-option">(Chọn nhiều đáp án)</span>
                    <span class="question-score">${quest.point} pt</span>
            </h2>`
            quest.answers.forEach(ans => {
                str += `
                    <input style="display: none" type="checkbox" id="answer_${ans.id}" name="question_${quest.id}" value="${ans.id}">
                    <label style="display: block" for="answer_${ans.id}" class="answer-item answer_${ans.id}">${ans.content}</label>
                `
            }) 
        }
        str += `</div>`
        return str
    })
    listQuestBlock.innerHTML = htmlsQuest.join('')
    document.querySelector('.scoreboard__test-name').innerHTML = `${test.name}`
    handleTimer(test, listQuest)
    handleAnswer(listQuest)
}


function handleAnswer(listQuest) {
    var questionListBlock = document.querySelector('.questions-list')
    var answerBtns = questionListBlock.querySelectorAll('input')
    
    answerBtns.forEach(ans => {
        ans.addEventListener('click', (e) => {
            if (ans.type == 'checkbox') {
                questionListBlock.querySelector(`.${ans.id}`).classList.toggle('enabled')
                
            } else {
                var parentElement = questionListBlock.querySelector(`.${ans.name}`)
                var otherChoices = parentElement.querySelectorAll('.answer-item')
                otherChoices.forEach(item => {
                    item.classList.remove('enabled')
                })
                questionListBlock.querySelector(`.${ans.id}`).classList.add('enabled')
            }
        })
    })
}


function handleTimer(currTest, listQuest) {
    var time = currTest.time
    var countdownElement = document.querySelector('.timer-countdown')

    // Quy đổi thời gian ra số giây
    time *= 60

    const id = setInterval(() => {
        time--
        
        let minutes = Math.floor(time / 60)
        let seconds = time % 60;
        
        minutes = minutes < 10 ? '0' + minutes : minutes
        seconds = seconds < 10 ? '0' + seconds : seconds
        
        countdownElement.innerHTML = `${minutes}: ${seconds}`

        handleSubmit(listQuest, id)
        
        if (time == 0) {
            document.querySelector('.submit-btn.btn').click()
            clearInterval(id)
        }
    }, 1000)
}

function handleSubmit(listQuest, id) {
    document.querySelector('.submit-btn.btn').addEventListener('click', () =>  {
        submitAnswers(listQuest)
        clearInterval(id)
    })
}

function submitAnswers(listQuest) {
    var questBlocks = document.querySelectorAll('.question-item')
    var userPoint = 0
    var totalPoint = 0
    
    questBlocks.forEach(questBlock => {
        var id = questBlock.getAttribute('data-set')
        currQuest = listQuest[id-1]
        var checkedInput = questBlock.querySelectorAll('input:checked')
        var userAns = [...checkedInput].map(item => item.value)

        totalPoint += parseInt(questBlock.getAttribute('value'))

        if (userAns.join() === currQuest.correctAnswers.join()) {
            userPoint += parseInt(questBlock.getAttribute('value'))
        }
        else {
            userAns.forEach(ans => {
                if (!currQuest.correctAnswers.includes(ans)) {
                    questBlock.querySelector(`.answer_${ans}`).classList.add('answer-item--wrong')
                }
            })
        }
        currQuest.correctAnswers.forEach(ans => {
            questBlock.querySelector(`.answer_${ans}`).classList.add('enabled')
        })
    })
    
    document.querySelector('.submit-btn.btn').disabled = true
    document.querySelector('.timer__icon').style.animation = 'none'
    document.querySelector('.scoreboard_pt').innerHTML = `Điểm số:
        <span class="scoreboard_pt-point">${userPoint}/${totalPoint}</span>
        `
    document.querySelector('.scoreboard__modal').classList.add('open')

    handleScoreModal(userPoint, totalPoint)

    return userPoint
}

function handleScoreModal(userPoint, totalPoint) {
    document.querySelector('.modal-score').innerHTML = `${userPoint}/${totalPoint}`
    var congratsBlock = document.querySelector('.congrats-description')
    var modal = document.querySelector('.scoreboard__modal')
    var modalContainer = document.querySelector('.modal-container')
    var closeBtn = document.querySelector('.close-btn')

    if (userPoint === totalPoint) {
        congratsBlock.innerHTML = 'Hãy giữ phong độ nhé! <3'
    } else if (userPoint >= totalPoint / 2) {
        congratsBlock.innerHTML = 'Cùng luyện tập nữa nào! ^^'
    } else {
        congratsBlock.innerHTML = 'Không đạt yêu cầu rồi ~.~'
    }

    closeBtn.addEventListener('click', () => {
       modal.classList.remove('open')
    })

    modal.addEventListener('click', () => {
        modal.classList.remove('open')
    })

    modalContainer.addEventListener('click', (e) => {
        e.stopPropagation()
    })
}

