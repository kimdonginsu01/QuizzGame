function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var selectorRules = {}

    // Ham thuc hien validate
    function validate(inputElement, rule) {
        var errorMessage
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)

        // Lay ra cac rules cua selector
        var rules = selectorRules[rule.selector]

        // Lap qua tung rules
        // Neu phat hien loi thi break
        for (index in rules) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[index](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break
                default: 
                    errorMessage = rules[index](inputElement.value)
            }
            errorMessage = rules[index](inputElement.value)
            if (errorMessage) break
        }
        
        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage
    }

    // Lay element cua form can validate
    var formElement = document.querySelector(options.form)
    if (formElement) {

        // Khi submit form
        formElement.onsubmit = (e) => {
            e.preventDefault()

            var isFormValid = true 


            // Lap qua tung rule va validate
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false
                }
            })

            if (isFormValid) {
                // Submit voi JS
                if (typeof options.onsubmit === 'function') {

                    var enableInputs = formElement.querySelectorAll('[name]')
                    
                    var formValues = Array.from(enableInputs).reduce((values, input) => {
                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                            case 'checkbox':
                                break
                            default:
                                values[input.name] = input.value
                        }
                        return values;
                    }, {})

                    options.onsubmit(formValues)
                } 
                // Submit voi hanh vi mac dinh
                else {
                    formElement.submit()
                }
            }
        }

        // Lap qua moi rule va xu ly (lang nghe su kien)
        options.rules.forEach(rule => {
            // Luu lai cac rules
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            }
            else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElements = formElement.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach((inputElement) => {
                inputElement.onblur = () => {
                    validate(inputElement, rule)
                }

                inputElement.oninput = () => {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message')
                    errorElement.innerText = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            })
        })
    }
}


// Định nghĩa rules
Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}

Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= 6 ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}

Validator.isConfirmed = (selector, getConfirmedValue, message) => {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmedValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}
