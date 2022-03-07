class promptWidget extends HTMLElement {
    constructor() {
        super();

        this.text = {
            "company":   "Организация или ИП",
            "shortName": "Краткое наименование",
            "fullName":  "Полное наименование",
            "INN/KPP":   "ИНН/КПП",
            "address":   "Адрес",
        }

        this.innerHTML = `
            <p><label for="company">${this.text["company"]}</label></p>
            <input id="company" type="text">
            <div id="suggestions" class="suggestions"></div>
            <p id="companyType"></p>
            <p><label for="shortName">${this.text["shortName"]}</label></p>
            <input id="shortName" type="text"><br>
            <p><label for="fullName">${this.text["fullName"]}</label></p>
            <input id="fullName" type="text"><br>
            <p><label for="INN/KPP">${this.text["INN/KPP"]}</label></p>
            <input id="INN/KPP" type="text"><br>
            <p><label for="address">${this.text["address"]}</label></p>
            <input id="address" type="text">
            `;

        const url         = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party";
        const token       = "f2ab33f7987b3a25df68fcbd7336449859969705";
        const company     = document.getElementById('company');
        const suggestions = document.getElementById('suggestions');
        const companyType = document.getElementById('companyType');
        const shortName   = document.getElementById('shortName');
        const fullName    = document.getElementById('fullName');
        const innKpp      = document.getElementById('INN/KPP');
        const address     = document.getElementById('address');
        let chosenCompany = "";
        let query         = "";

        function addOptions(quer){
            let options = {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Token " + token
                },
                body: JSON.stringify({query: quer})
            }

            return options;
        }

        function typeDescription(type) {
            var TYPES = {
                'INDIVIDUAL': 'Индивидуальный предприниматель',
                'LEGAL': 'Организация'
            }
            return TYPES[type];
        }

        document.addEventListener("click", (e) => {
            if (e.target.classList.contains('suggestion')) {
                chosenCompany = e.target.innerHTML;
                suggestions.style.display = 'none';
                fetch(url, addOptions(chosenCompany))
                    .then(resp => {return resp.json()})
                    .then(resBody => {
                        company.value         = resBody.suggestions[0].value;
                        companyType.innerHTML = typeDescription(resBody.suggestions[0].data.type) + " (" + resBody.suggestions[0].data.type + ")";
                        shortName.value       = resBody.suggestions[0].data.name.short_with_opf;
                        fullName.value        = resBody.suggestions[0].data.name.full_with_opf;
                        innKpp.value          = resBody.suggestions[0].data.inn + " / " + resBody.suggestions[0].data.kpp;
                        address.value         = resBody.suggestions[0].data.address.data.postal_code + ", " + resBody.suggestions[0].data.address.value;
                    })
            }
        })

        company.addEventListener('keyup' , function () {
            suggestions.style.display = 'block';
            query = company.value;
            fetch(url, addOptions(query))
                .then(resp => {return resp.json()})
                .then(resBody => {
                    suggestions.innerHTML = "";
                    for(let i = 0 ; i<5 ; i++){
                        suggestions.innerHTML += `<div class="suggestion">${resBody.suggestions[i].value}</div>`
                    }
                })
        })
    }
}

customElements.define("prompt-widget", promptWidget);