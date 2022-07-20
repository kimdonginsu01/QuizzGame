var testApi = 'http://localhost:3000/tests'

start()

async function start() {
    const tests = await getTests()
    await renderSidebarItem(tests)
    await handleQuestion(tests)
}

async function getTests() {
    const response = await fetch(testApi)
    const data = await response.json()
    return data
}

async function renderSidebarItem(tests){
    var listTestsBlock = document.querySelector('.sidebar-list')
    var htmlsTest = tests.map(test => {
        return `
            <div class="sidebar-item btn" data-set="${test.id}">
            <i class="sidebar-icon ${test.icon}"></i>
            <span class="sidebar-content">${test.name}</span>
            </div>
        `
    })
    listTestsBlock.innerHTML = htmlsTest.join('')
}

async function handleQuestion(tests) {
    var testBtn = document.querySelectorAll('.sidebar-item')
    testBtn.forEach((btn) => {
        btn.addEventListener('click', () => {
            var id = btn.getAttribute('data-set')
            var currTest = tests[id - 1]
            var listQuest = currTest.questions

            location.replace(`http://127.0.0.1:5500/Pages/TestPage.html?id=${id}`)
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