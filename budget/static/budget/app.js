// load DOM page
document.addEventListener('DOMContentLoaded', function () {
    // load with intro
    load_page("intro")
    // when navbar click page loads
    document.querySelector("#intro-nav").addEventListener('click', () => load_page("intro"));
    document.querySelector("#profile-nav").addEventListener('click', () => load_page("profile"));
    document.querySelector("#transacciones-nav").addEventListener('click', () => load_page("transacciones"));
    document.querySelector("#main-summary-nav").addEventListener('click', () => load_page("main-summary"));
    document.querySelector("#presupuesto-nav").addEventListener('click', () => load_page("presupuesto"));
    // main content loaded when page loads, background functions
    toggle_transaction_summary()
    transactions_onchange()
    // add new transaction & add new budget
    document.querySelector("#newTransaction").onsubmit = add_new_transaction;
    document.querySelector("#budget-form").onsubmit = add_budget;
});

// load page function
function load_page(page) {
    if (page === "transacciones") {
        document.querySelector("#transactions").style.display = "block";
        document.querySelector("#profile").style.display = "none";
        document.querySelector("#intro").style.display = "none";
        document.querySelector("#main-summary").style.display = "none";
        document.querySelector("#presupuesto").style.display = "none";
        load_transactions();
    }
    else if (page === "main-summary") {
        document.querySelector("#main-summary").style.display = "block";
        document.querySelector("#profile").style.display = "none";
        document.querySelector("#intro").style.display = "none";
        document.querySelector("#transactions").style.display = "none";
        document.querySelector("#presupuesto").style.display = "none";
        general_summary();
        createGraph();
    }
    else if(page === "profile") {
        document.querySelector("#profile").style.display = "block";
        document.querySelector("#intro").style.display = "none";
        document.querySelector("#main-summary").style.display = "none";
        document.querySelector("#transactions").style.display = "none";
        document.querySelector("#presupuesto").style.display = "none";
    }
    else if(page === "intro") {
        document.querySelector("#intro").style.display = "block";
        document.querySelector("#profile").style.display = "none";
        document.querySelector("#main-summary").style.display = "none";
        document.querySelector("#transactions").style.display = "none";
        document.querySelector("#presupuesto").style.display = "none";
    }
    else if(page === "presupuesto") {
        document.querySelector("#presupuesto").style.display = "block";
        document.querySelector("#intro").style.display = "none";
        document.querySelector("#profile").style.display = "none";
        document.querySelector("#main-summary").style.display = "none";
        document.querySelector("#transactions").style.display = "none";
        load_budget();
    }
}

function load_budget() {
    // erase previous loads of table
    document.querySelector("#tabla-presupuesto").innerHTML = "";
    // get budget data from database
    fetch("/budget")
        .then(response => response.json())
        .then(data => {
            // check if user has registered budget
            if(data.budget.length === 0) {
                return;
            }
            // check if user has set all budget elements
            if(data.budget.length === 9) {
                document.querySelector("#budget-form").innerHTML = "";
            }
            // check if user has incomplete budget elements to register and delete those that have already been registered
            if (data.budget.length < 9) {
                // dissapear options in form in case user has already set budget for that category
                data.budget.forEach(category => {
                    if(document.querySelector("#budget-apps").innerHTML === category.category) { document.querySelector("#budget-apps").style.display = "none";}
                    else if(document.querySelector("#budget-servicios").innerHTML === category.category) { document.querySelector("#budget-servicios").style.display = "none";}
                    else if(document.querySelector("#budget-otros").innerHTML === category.category) { document.querySelector("#budget-otros").style.display = "none";}
                    else if(document.querySelector("#budget-alimentos").innerHTML === category.category) { document.querySelector("#budget-alimentos").style.display = "none";}
                    else if(document.querySelector("#budget-suplementos").innerHTML === category.category) { document.querySelector("#budget-suplementos").style.display = "none";}
                    else if(document.querySelector("#budget-cuidadopersonal").innerHTML === category.category) { document.querySelector("#budget-cuidadopersonal").style.display = "none";}
                    else if(document.querySelector("#budget-seguros").innerHTML === category.category) { document.querySelector("#budget-seguros").style.display = "none";}
                    else if(document.querySelector("#budget-limpieza").innerHTML === category.category) { document.querySelector("#budget-limpieza").style.display = "none";}
                    else if(document.querySelector("#budget-alquiler").innerHTML === category.category) { document.querySelector("#budget-alquiler").style.display = "none";}
                })
            }
            // get table element
            const table = document.querySelector("#tabla-presupuesto")
            // create table head element
            const thead = document.createElement('thead')
            const thead_tr = document.createElement('tr')
            thead_tr.innerHTML = `<th scope='col'>Categoria</th>
                                  <th scope='col'>Monto</th>
                                  <th scope='col'>Última modificación</th>
                                    `
            thead.appendChild(thead_tr);
            const tbody = document.createElement('tbody')
            data.budget.forEach(item => {
                console.log(item)
                // create body elements
                const tbody_tr = document.createElement('tr')
                tbody_tr.innerHTML = `<td>${item.category}</td>
                                      <td>${item.amount}</td>
                                      <td>${item.input_date}</td>
                                    `
                tbody.appendChild(tbody_tr)
            })
            // create total row
            const total_tr = document.createElement('tr')
            total_tr.innerHTML = `<th scope='row'>Total</th>
                                <td>${data.total_budget}</td>
                                <td></td>
                                    `
            tbody.append(total_tr)
            // append elements to table outside the loop
            table.append(thead, tbody)
        })
        .catch(error => console.log(error))
}

function add_budget() {
    // get form values for category and amount
    const budget_category = document.querySelector("#budget-category").value;
    const budget_amount = document.querySelector("#budget-amount").value;
    // get csrf token from django template {% csrf_token %}
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // send data via post
    fetch('/add_budget', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        mode: 'same-origin',
        body: JSON.stringify({
            category: budget_category,
            amount: budget_amount
        })
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            load_budget();
            document.querySelector("#budget-category").value = "";
            document.querySelector("#budget-amount").value = "";
        })
        .catch(error => console.log(error))
    return false;
}

function add_new_transaction() {
    // get form values for date,category,description and amount
    const new_transaction_date = document.querySelector("#transaction-date").value
    const new_transaction_category = document.querySelector("#transaction-category").value
    const new_transaction_description = document.querySelector("#transaction-description").value
    const new_transaction_amount = document.querySelector("#transaction-amount").value
    // get csrf token from django template {% csrf_token %}
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // send data via fetch post
    fetch('/new_transaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        mode: 'same-origin',
        body: JSON.stringify({
            date: new_transaction_date,
            category: new_transaction_category,
            description: new_transaction_description,
            amount: new_transaction_amount
        })
    })
        .then(response => response.json())
        .then(result => {
            load_transactions(result.dataTransactionMonth, result.dataTransactionYear);
            // get selector from form and empty data after creating new transaction
            document.querySelector("#transaction-description").value = "";
            document.querySelector("#transaction-amount").value = "";
        })
        .catch(error => console.log(error))
    return false;
}

// create graph
function createGraph() {
    // get canvas section element and erase previous loads
    const canvas_section = document.querySelector("#charts")
    canvas_section.innerHTML = "";
    const error_summary = document.querySelector("#error-selection-summary")
    error_summary.style.display = "none";
    // get selected year
    let selected_year = document.querySelector("#select-summary-year")
    let value_year = selected_year.value
    fetch(`/general_summary/date?year=${value_year}`)
        .then(response => response.json())
        .then(data => { 
            // if no data
            if (data.total_monthly.length === 0) {
                error_summary.style.display = "block";
                error_summary.innerHTML = "No existe información para el año seleccionado."
                return
            }
            // generate cards per graph and get charts id
            const charts = document.querySelector("#charts");
            // create row 
            const rowBarCard = document.createElement('div')
            rowBarCard.className = "row justify-content-center"
            // create column
            const colBarCard = document.createElement('div')
            colBarCard.className = "col-md-6 my-3"
            //create barCard element
            const barCard = document.createElement('div')
            barCard.className = "card h-100 w-75 mx-auto"
            //create card title
            const barCardTitle = document.createElement('div')
            barCardTitle.className = "card-body pb-0 text-center"
            barCardTitle.innerHTML = "<h3 class='text-success'>Evolución de gastos mensuales</h3><hr>"
            // create card body 
            const barCardBody = document.createElement('div')
            barCardBody.className = "card-body"
            // create canvas element
            const barCanvas = document.createElement('canvas')
            // append barCanvas to barCardBody
            colBarCard.appendChild(barCard)
            barCard.append(barCardTitle, barCardBody)
            barCardBody.appendChild(barCanvas)
            
            // create pie chart from col
            const colPieCard = document.createElement('div')
            colPieCard.className = "col-md-6 my-3"
            // create pie card
            const pieCard = document.createElement('div')
            pieCard.className = "card h-100 w-75 mx-auto"
            // create pie card title
            const pieCardTitle = document.createElement('div')
            pieCardTitle.className = "card-body pb-0 text-center"
            pieCardTitle.innerHTML = "<h3 class='text-success'>Gastos anuales por categoria</h3><hr>"
            // create pie card body
            const pieCardBody = document.createElement('div')
            pieCardBody.className = "card-body"
            // create pieCanvas
            const pieCanvas = document.createElement('canvas')
            // append pieCanvas to pieCardBody
            colPieCard.appendChild(pieCard)
            pieCard.append(pieCardTitle, pieCardBody)
            pieCardBody.appendChild(pieCanvas)

            // append to row
            rowBarCard.append(colBarCard, colPieCard)
            charts.append(rowBarCard);
            
            // Build the gastos mensuales graph
            const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            date = data.total_monthly.map(element => { 
                return monthNames[element.date__month - 1]
            })
            categ_sum = data.total_monthly.map(element => {
                return parseInt(element.categ_sum);
            })
            let barChart = barCanvas.getContext('2d');
            let gastoMensual = new Chart(barChart, {
                type: 'bar', 
                data: {
                    labels: date,
                    datasets: [{
                        label: 'Gasto mensual',
                        data: categ_sum,
                        backgroundColor: "#217D1C",
                        hoverBackgroundColor: "#9AFF60",
                        borderColor: 'black',
                        borderWidth: 2
                    }]
                },
                options: {
                    maintainApsectRatio: false,
                    plugins: {
                    }
                }
            });
            // Build the pie chart by expenses
            categories = data.category_sum.map(element => {
                return data.categories[element.category]
            })
            const array_category_sum = []
            data.category_sum.map(element => {
                return array_category_sum.push(parseInt(element.categ_sum))
            })
            let total_category_sum = array_category_sum.reduce((a,b) => a + b, 0)
            category_added = data.category_sum.map(element => {
                return (((parseInt(element.categ_sum) / total_category_sum) * 100).toFixed(0))
            })
            let  ctx = pieCanvas.getContext('2d');
            const pieCategorias = new Chart(ctx, {
                // type of chart to createe
                type: 'pie',
                // data for dataset
                data: {
                    labels: categories,
                    datasets: [{
                        label: 'Gasto anual',
                        data: category_added,
                        backgroundColor: [
                            "#A863E1", "#957129", "#2F6543", "#FFE51E", "#9A1A74", "#C85C1D", "#2F54FF",
                            "#F80000", "#EFA94A"
                        ],
                        borderColor: "black",
                        borderWidth: 1,
                        hoverBackgroundColor: "#9AFF60"
                    }] } ,
                    // options configuration
                    options: {
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                                fontColor: 'white'
                            },
                            tooltip: {
                                enabled: false
                            },
                            datalabels: {
                                display: true,
                                color: "black",
                                font: {
                                    weight: "bold",
                                },
                                formatter: (value, context) => {
                                    if (value < 5) return "";
                                    return value + "%";
                                }
                            }
                        }
                    },
                    plugins: [ChartDataLabels]
                });
            })
}

// general summary function
function general_summary() {
    // eliminate table display to avoid repetition when reloading and error display
    document.querySelector("#main-summary-table").innerHTML = "";
    const error_summary = document.querySelector("#error-selection-summary")
    error_summary.style.display = "none";
    // get selected year
    let selected_year = document.querySelector("#select-summary-year")
    let value_year = selected_year.value
    fetch(`/general_summary/date?year=${value_year}`)
    .then(response => response.json())
    .then(data => { 
        // if no data
        if (data.total_monthly.length === 0) {
            error_summary.style.display = "block";
            error_summary.innerHTML = "No existe información para el año seleccionado."
            return
        }
        // get table,create table head, table row and first th for Categorias
        const table = document.querySelector("#main-summary-table")
        const table_head = document.createElement("thead")
        const table_head_row = document.createElement("tr")
        const th_categorias = document.createElement("th")
        th_categorias.innerHTML = "Categorias"
        table_head_row.append(th_categorias)
        table.append(table_head, table_head_row)
        // check if data exists per month, then add month column
        if (data.january.length > 0) {let td = document.createElement("th"); td.innerHTML = "Enero"; table_head_row.append(td)} 
        if (data.february.length > 0) { let td = document.createElement("th"); td.innerHTML = "Febrero"; table_head_row.append(td);} 
        if (data.march.length > 0) { let td = document.createElement("th"); td.innerHTML = "Marzo"; table_head_row.append(td);} 
        if (data.april.length > 0) { let td = document.createElement("th"); td.innerHTML = "Abril"; table_head_row.append(td);} 
        if (data.may.length > 0) { let td = document.createElement("th"); td.innerHTML = "Mayo"; table_head_row.append(td);} 
        if (data.june.length > 0) { let td = document.createElement("th"); td.innerHTML = "Junio"; table_head_row.append(td);} 
        if (data.july.length > 0) { let td = document.createElement("th"); td.innerHTML = "Julio"; table_head_row.append(td);} 
        if (data.august.length > 0) { let td = document.createElement("th"); td.innerHTML = "Agosto"; table_head_row.append(td);} 
        if (data.september.length > 0) { let td = document.createElement("th"); td.innerHTML = "Septiembre"; table_head_row.append(td);} 
        if (data.october.length > 0) { let td = document.createElement("th"); td.innerHTML = "Octubre"; table_head_row.append(td);} 
        if (data.november.length > 0) { let td = document.createElement("th"); td.innerHTML = "Noviembre"; table_head_row.append(td);} 
        if (data.december.length > 0) { let td = document.createElement("th"); td.innerHTML = "Diciembre"; table_head_row.append(td);} 
        // create tbody, create tr, and td for each category
            // table body row elements and add data attribute to each
        const table_body = document.createElement("tbody")
        let table_body_row_apps = document.createElement("tr"); table_body_row_apps.dataset.category = 2;
        let table_body_row_servicios = document.createElement("tr"); table_body_row_servicios.dataset.category = 3;
        let table_body_row_otros = document.createElement("tr"); table_body_row_otros.dataset.category = 4;
        let table_body_row_alimentos = document.createElement("tr"); table_body_row_alimentos.dataset.category = 5;
        let table_body_row_suplementos = document.createElement("tr"); table_body_row_suplementos.dataset.category = 6;
        let table_body_row_cuid_pers = document.createElement("tr"); table_body_row_cuid_pers.dataset.category = 7;
        let table_body_row_seguros = document.createElement("tr"); table_body_row_seguros.dataset.category = 8;
        let table_body_row_limpieza = document.createElement("tr"); table_body_row_limpieza.dataset.category = 9;
        let table_body_row_alquiler = document.createElement("tr"); table_body_row_alquiler.dataset.category = 10;
        let table_body_row_total = document.createElement("tr");
        // fixed table heading elements
        let th_apps = document.createElement("th"); th_apps.innerHTML = "Apps"; table_body_row_apps.append(th_apps);
        let th_servicios = document.createElement("th"); th_servicios.innerHTML = "Servicios"; table_body_row_servicios.append(th_servicios);
        let th_otros = document.createElement("th"); th_otros.innerHTML = "Otros"; table_body_row_otros.append(th_otros);
        let th_alimentos = document.createElement("th"); th_alimentos.innerHTML = "Alimentos"; table_body_row_alimentos.append(th_alimentos);
        let th_suplementos = document.createElement("th"); th_suplementos.innerHTML = "Suplementos"; table_body_row_suplementos.append(th_suplementos);
        let th_cuid_pers = document.createElement("th"); th_cuid_pers.innerHTML = "Cuidado personal"; table_body_row_cuid_pers.append(th_cuid_pers);
        let th_seguros = document.createElement("th"); th_seguros.innerHTML = "Seguros"; table_body_row_seguros.append(th_seguros);
        let th_limpieza = document.createElement("th"); th_limpieza.innerHTML = "Limpieza"; table_body_row_limpieza.append(th_limpieza);
        let th_alquiler = document.createElement("th"); th_alquiler.innerHTML = "Alquiler"; table_body_row_alquiler.append(th_alquiler);
        let th_total = document.createElement("th"); th_total.innerHTML = "Total"; table_body_row_total.append(th_total);
        // get data for total per month (data.total_monthly[0].categ_sum) and add per all total months
        if(data.total_monthly[0]) { let td_month = document.createElement("td");td_month.innerHTML = `${parseInt(data.total_monthly[0].categ_sum).toFixed(0)}`;table_body_row_total.append(td_month);} 
        if(data.total_monthly[1]) { let td_month = document.createElement("td");td_month.innerHTML = `${parseInt(data.total_monthly[1].categ_sum).toFixed(0)}`;table_body_row_total.append(td_month);} 
        if(data.total_monthly[2]) { let td_month = document.createElement("td");td_month.innerHTML = `${parseInt(data.total_monthly[2].categ_sum).toFixed(0)}`;table_body_row_total.append(td_month)} 
        if(data.total_monthly[3]) { let td_month = document.createElement("td");td_month.innerHTML = `${parseInt(data.total_monthly[3].categ_sum).toFixed(0)}`;table_body_row_total.append(td_month)} 
        if(data.total_monthly[4]) { let td_month = document.createElement("td");td_month.innerHTML = `${parseInt(data.total_monthly[4].categ_sum).toFixed(0)}`;table_body_row_total.append(td_month)} 
        if(data.total_monthly[5]) { let td_month = document.createElement("td");td_month.innerHTML = `${parseInt(data.total_monthly[5].categ_sum).toFixed(0)}`;table_body_row_total.append(td_month)} 
        if(data.total_monthly[6]) { let td_month = document.createElement("td");td_month.innerHTML = `${parseInt(data.total_monthly[6].categ_sum).toFixed(0)}`;table_body_row_total.append(td_month)} 
        if(data.total_monthly[7]) { let td_month = document.createElement("td");td_month.innerHTML = `${parseInt(data.total_monthly[7].categ_sum).toFixed(0)}`;table_body_row_total.append(td_month)} 
        if(data.total_monthly[8]) { let td_month = document.createElement("td");td_month.innerHTML = `${parseInt(data.total_monthly[8].categ_sum).toFixed(0)}`;table_body_row_total.append(td_month)} 
        if(data.total_monthly[9]) { let td_month = document.createElement("td");td_month.innerHTML = `${parseInt(data.total_monthly[9].categ_sum).toFixed(0)}`;table_body_row_total.append(td_month)} 
        if(data.total_monthly[10]) { let td_month = document.createElement("td");td_month.innerHTML = `${parseInt(data.total_monthly[10].categ_sum).toFixed(0)}`;table_body_row_total.append(td_month)} 
        if(data.total_monthly[11]) { let td_month = document.createElement("td");td_month.innerHTML = `${parseInt(data.total_monthly[11].categ_sum).toFixed(0)}`;table_body_row_total.append(td_month)} 
        if(data.total_monthly[12]) { let td_month = document.createElement("td");td_month.innerHTML = `${parseInt(data.total_monthly[12].categ_sum).toFixed(0)}`;table_body_row_total.append(td_month)} 
        // check if data attribute is equal to category per month and create cell if it does exist
        data.january.forEach(item => {  
            if (item.category === parseInt(table_body_row_apps.dataset.category)) { let td_apps = document.createElement("td"); td_apps.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_apps.append(td_apps);}
            if (item.category === parseInt(table_body_row_servicios.dataset.category)) { let td_serv = document.createElement("td"); td_serv.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_servicios.append(td_serv);}
            if (item.category === parseInt(table_body_row_otros.dataset.category)) { let td_otros = document.createElement("td");td_otros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_otros.append(td_otros);}
            if (item.category === parseInt(table_body_row_alimentos.dataset.category)) { let td_alimentos = document.createElement("td");td_alimentos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alimentos.append(td_alimentos);}
            if (item.category === parseInt(table_body_row_suplementos.dataset.category)) { let td_suplementos = document.createElement("td");td_suplementos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_suplementos.append(td_suplementos);}
            if (item.category === parseInt(table_body_row_cuid_pers.dataset.category)) { let td_cuid_pers = document.createElement("td");td_cuid_pers.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_cuid_pers.append(td_cuid_pers);}
            if (item.category === parseInt(table_body_row_seguros.dataset.category)) { let td_seguros = document.createElement("td");td_seguros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_seguros.append(td_seguros);}
            if (item.category === parseInt(table_body_row_limpieza.dataset.category)) { let td_limpieza = document.createElement("td");td_limpieza.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_limpieza.append(td_limpieza);}
            if (item.category === parseInt(table_body_row_alquiler.dataset.category)) { let td_alquiler = document.createElement("td");td_alquiler.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alquiler.append(td_alquiler);}

        })
        data.february.forEach(item => { 
            if (item.category === parseInt(table_body_row_apps.dataset.category)) { let td_apps = document.createElement("td"); td_apps.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_apps.append(td_apps);}
            if (item.category === parseInt(table_body_row_servicios.dataset.category)) { let td_serv = document.createElement("td"); td_serv.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_servicios.append(td_serv);}
            if (item.category === parseInt(table_body_row_otros.dataset.category)) { let td_otros = document.createElement("td");td_otros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_otros.append(td_otros);}
            if (item.category === parseInt(table_body_row_alimentos.dataset.category)) { let td_alimentos = document.createElement("td");td_alimentos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alimentos.append(td_alimentos);}
            if (item.category === parseInt(table_body_row_suplementos.dataset.category)) { let td_suplementos = document.createElement("td");td_suplementos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_suplementos.append(td_suplementos);}
            if (item.category === parseInt(table_body_row_cuid_pers.dataset.category)) { let td_cuid_pers = document.createElement("td");td_cuid_pers.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_cuid_pers.append(td_cuid_pers);}
            if (item.category === parseInt(table_body_row_seguros.dataset.category)) { let td_seguros = document.createElement("td");td_seguros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_seguros.append(td_seguros);}
            if (item.category === parseInt(table_body_row_limpieza.dataset.category)) { let td_limpieza = document.createElement("td");td_limpieza.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_limpieza.append(td_limpieza);}
            if (item.category === parseInt(table_body_row_alquiler.dataset.category)) { let td_alquiler = document.createElement("td");td_alquiler.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alquiler.append(td_alquiler);}
        })
        data.march.forEach(item => { 
            if (item.category === parseInt(table_body_row_apps.dataset.category)) { let td_apps = document.createElement("td"); td_apps.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_apps.append(td_apps);}
            if (item.category === parseInt(table_body_row_servicios.dataset.category)) { let td_serv = document.createElement("td"); td_serv.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_servicios.append(td_serv);}
            if (item.category === parseInt(table_body_row_otros.dataset.category)) { let td_otros = document.createElement("td");td_otros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_otros.append(td_otros);}
            if (item.category === parseInt(table_body_row_alimentos.dataset.category)) { let td_alimentos = document.createElement("td");td_alimentos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alimentos.append(td_alimentos);}
            if (item.category === parseInt(table_body_row_suplementos.dataset.category)) { let td_suplementos = document.createElement("td");td_suplementos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_suplementos.append(td_suplementos);}
            if (item.category === parseInt(table_body_row_cuid_pers.dataset.category)) { let td_cuid_pers = document.createElement("td");td_cuid_pers.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_cuid_pers.append(td_cuid_pers);}
            if (item.category === parseInt(table_body_row_seguros.dataset.category)) { let td_seguros = document.createElement("td");td_seguros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_seguros.append(td_seguros);}
            if (item.category === parseInt(table_body_row_limpieza.dataset.category)) { let td_limpieza = document.createElement("td");td_limpieza.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_limpieza.append(td_limpieza);}
            if (item.category === parseInt(table_body_row_alquiler.dataset.category)) { let td_alquiler = document.createElement("td");td_alquiler.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alquiler.append(td_alquiler);}
        })
        data.april.forEach(item => { 
            if (item.category === parseInt(table_body_row_apps.dataset.category)) { let td_apps = document.createElement("td"); td_apps.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_apps.append(td_apps);}
            if (item.category === parseInt(table_body_row_servicios.dataset.category)) { let td_serv = document.createElement("td"); td_serv.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_servicios.append(td_serv);}
            if (item.category === parseInt(table_body_row_otros.dataset.category)) { let td_otros = document.createElement("td");td_otros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_otros.append(td_otros);}
            if (item.category === parseInt(table_body_row_alimentos.dataset.category)) { let td_alimentos = document.createElement("td");td_alimentos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alimentos.append(td_alimentos);}
            if (item.category === parseInt(table_body_row_suplementos.dataset.category)) { let td_suplementos = document.createElement("td");td_suplementos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_suplementos.append(td_suplementos);}
            if (item.category === parseInt(table_body_row_cuid_pers.dataset.category)) { let td_cuid_pers = document.createElement("td");td_cuid_pers.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_cuid_pers.append(td_cuid_pers);}
            if (item.category === parseInt(table_body_row_seguros.dataset.category)) { let td_seguros = document.createElement("td");td_seguros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_seguros.append(td_seguros);}
            if (item.category === parseInt(table_body_row_limpieza.dataset.category)) { let td_limpieza = document.createElement("td");td_limpieza.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_limpieza.append(td_limpieza);}
            if (item.category === parseInt(table_body_row_alquiler.dataset.category)) { let td_alquiler = document.createElement("td");td_alquiler.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alquiler.append(td_alquiler);}
        })
        data.may.forEach(item => { 
            if (item.category === parseInt(table_body_row_apps.dataset.category)) { let td_apps = document.createElement("td"); td_apps.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_apps.append(td_apps);}
            if (item.category === parseInt(table_body_row_servicios.dataset.category)) { let td_serv = document.createElement("td"); td_serv.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_servicios.append(td_serv);}
            if (item.category === parseInt(table_body_row_otros.dataset.category)) { let td_otros = document.createElement("td");td_otros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_otros.append(td_otros);}
            if (item.category === parseInt(table_body_row_alimentos.dataset.category)) { let td_alimentos = document.createElement("td");td_alimentos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alimentos.append(td_alimentos);}
            if (item.category === parseInt(table_body_row_suplementos.dataset.category)) { let td_suplementos = document.createElement("td");td_suplementos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_suplementos.append(td_suplementos);}
            if (item.category === parseInt(table_body_row_cuid_pers.dataset.category)) { let td_cuid_pers = document.createElement("td");td_cuid_pers.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_cuid_pers.append(td_cuid_pers);}
            if (item.category === parseInt(table_body_row_seguros.dataset.category)) { let td_seguros = document.createElement("td");td_seguros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_seguros.append(td_seguros);}
            if (item.category === parseInt(table_body_row_limpieza.dataset.category)) { let td_limpieza = document.createElement("td");td_limpieza.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_limpieza.append(td_limpieza);}
            if (item.category === parseInt(table_body_row_alquiler.dataset.category)) { let td_alquiler = document.createElement("td");td_alquiler.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alquiler.append(td_alquiler);}
        })
        data.june.forEach(item => { 
            if (item.category === parseInt(table_body_row_apps.dataset.category)) { let td_apps = document.createElement("td"); td_apps.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_apps.append(td_apps);}
            if (item.category === parseInt(table_body_row_servicios.dataset.category)) { let td_serv = document.createElement("td"); td_serv.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_servicios.append(td_serv);}
            if (item.category === parseInt(table_body_row_otros.dataset.category)) { let td_otros = document.createElement("td");td_otros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_otros.append(td_otros);}
            if (item.category === parseInt(table_body_row_alimentos.dataset.category)) { let td_alimentos = document.createElement("td");td_alimentos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alimentos.append(td_alimentos);}
            if (item.category === parseInt(table_body_row_suplementos.dataset.category)) { let td_suplementos = document.createElement("td");td_suplementos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_suplementos.append(td_suplementos);}
            if (item.category === parseInt(table_body_row_cuid_pers.dataset.category)) { let td_cuid_pers = document.createElement("td");td_cuid_pers.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_cuid_pers.append(td_cuid_pers);}
            if (item.category === parseInt(table_body_row_seguros.dataset.category)) { let td_seguros = document.createElement("td");td_seguros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_seguros.append(td_seguros);}
            if (item.category === parseInt(table_body_row_limpieza.dataset.category)) { let td_limpieza = document.createElement("td");td_limpieza.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_limpieza.append(td_limpieza);}
            if (item.category === parseInt(table_body_row_alquiler.dataset.category)) { let td_alquiler = document.createElement("td");td_alquiler.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alquiler.append(td_alquiler);}
        })
        data.july.forEach(item => { 
            if (item.category === parseInt(table_body_row_apps.dataset.category)) { let td_apps = document.createElement("td"); td_apps.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_apps.append(td_apps);}
            if (item.category === parseInt(table_body_row_servicios.dataset.category)) { let td_serv = document.createElement("td"); td_serv.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_servicios.append(td_serv);}
            if (item.category === parseInt(table_body_row_otros.dataset.category)) { let td_otros = document.createElement("td");td_otros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_otros.append(td_otros);}
            if (item.category === parseInt(table_body_row_alimentos.dataset.category)) { let td_alimentos = document.createElement("td");td_alimentos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alimentos.append(td_alimentos);}
            if (item.category === parseInt(table_body_row_suplementos.dataset.category)) { let td_suplementos = document.createElement("td");td_suplementos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_suplementos.append(td_suplementos);}
            if (item.category === parseInt(table_body_row_cuid_pers.dataset.category)) { let td_cuid_pers = document.createElement("td");td_cuid_pers.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_cuid_pers.append(td_cuid_pers);}
            if (item.category === parseInt(table_body_row_seguros.dataset.category)) { let td_seguros = document.createElement("td");td_seguros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_seguros.append(td_seguros);}
            if (item.category === parseInt(table_body_row_limpieza.dataset.category)) { let td_limpieza = document.createElement("td");td_limpieza.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_limpieza.append(td_limpieza);}
            if (item.category === parseInt(table_body_row_alquiler.dataset.category)) { let td_alquiler = document.createElement("td");td_alquiler.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alquiler.append(td_alquiler);}
        })
        data.august.forEach(item => { 
            if (item.category === parseInt(table_body_row_apps.dataset.category)) { let td_apps = document.createElement("td"); td_apps.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_apps.append(td_apps);}
            if (item.category === parseInt(table_body_row_servicios.dataset.category)) { let td_serv = document.createElement("td"); td_serv.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_servicios.append(td_serv);}
            if (item.category === parseInt(table_body_row_otros.dataset.category)) { let td_otros = document.createElement("td");td_otros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_otros.append(td_otros);}
            if (item.category === parseInt(table_body_row_alimentos.dataset.category)) { let td_alimentos = document.createElement("td");td_alimentos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alimentos.append(td_alimentos);}
            if (item.category === parseInt(table_body_row_suplementos.dataset.category)) { let td_suplementos = document.createElement("td");td_suplementos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_suplementos.append(td_suplementos);}
            if (item.category === parseInt(table_body_row_cuid_pers.dataset.category)) { let td_cuid_pers = document.createElement("td");td_cuid_pers.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_cuid_pers.append(td_cuid_pers);}
            if (item.category === parseInt(table_body_row_seguros.dataset.category)) { let td_seguros = document.createElement("td");td_seguros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_seguros.append(td_seguros);}
            if (item.category === parseInt(table_body_row_limpieza.dataset.category)) { let td_limpieza = document.createElement("td");td_limpieza.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_limpieza.append(td_limpieza);}
            if (item.category === parseInt(table_body_row_alquiler.dataset.category)) { let td_alquiler = document.createElement("td");td_alquiler.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alquiler.append(td_alquiler);}
        })
        data.september.forEach(item => { 
            if (item.category === parseInt(table_body_row_apps.dataset.category)) { let td_apps = document.createElement("td"); td_apps.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_apps.append(td_apps);}
            if (item.category === parseInt(table_body_row_servicios.dataset.category)) { let td_serv = document.createElement("td"); td_serv.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_servicios.append(td_serv);}
            if (item.category === parseInt(table_body_row_otros.dataset.category)) { let td_otros = document.createElement("td");td_otros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_otros.append(td_otros);}
            if (item.category === parseInt(table_body_row_alimentos.dataset.category)) { let td_alimentos = document.createElement("td");td_alimentos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alimentos.append(td_alimentos);}
            if (item.category === parseInt(table_body_row_suplementos.dataset.category)) { let td_suplementos = document.createElement("td");td_suplementos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_suplementos.append(td_suplementos);}
            if (item.category === parseInt(table_body_row_cuid_pers.dataset.category)) { let td_cuid_pers = document.createElement("td");td_cuid_pers.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_cuid_pers.append(td_cuid_pers);}
            if (item.category === parseInt(table_body_row_seguros.dataset.category)) { let td_seguros = document.createElement("td");td_seguros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_seguros.append(td_seguros);}
            if (item.category === parseInt(table_body_row_limpieza.dataset.category)) { let td_limpieza = document.createElement("td");td_limpieza.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_limpieza.append(td_limpieza);}
            if (item.category === parseInt(table_body_row_alquiler.dataset.category)) { let td_alquiler = document.createElement("td");td_alquiler.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alquiler.append(td_alquiler);}
        })
        data.october.forEach(item => { 
            if (item.category === parseInt(table_body_row_apps.dataset.category)) { let td_apps = document.createElement("td"); td_apps.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_apps.append(td_apps);}
            if (item.category === parseInt(table_body_row_servicios.dataset.category)) { let td_serv = document.createElement("td"); td_serv.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_servicios.append(td_serv);}
            if (item.category === parseInt(table_body_row_otros.dataset.category)) { let td_otros = document.createElement("td");td_otros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_otros.append(td_otros);}
            if (item.category === parseInt(table_body_row_alimentos.dataset.category)) { let td_alimentos = document.createElement("td");td_alimentos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alimentos.append(td_alimentos);}
            if (item.category === parseInt(table_body_row_suplementos.dataset.category)) { let td_suplementos = document.createElement("td");td_suplementos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_suplementos.append(td_suplementos);}
            if (item.category === parseInt(table_body_row_cuid_pers.dataset.category)) { let td_cuid_pers = document.createElement("td");td_cuid_pers.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_cuid_pers.append(td_cuid_pers);}
            if (item.category === parseInt(table_body_row_seguros.dataset.category)) { let td_seguros = document.createElement("td");td_seguros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_seguros.append(td_seguros);}
            if (item.category === parseInt(table_body_row_limpieza.dataset.category)) { let td_limpieza = document.createElement("td");td_limpieza.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_limpieza.append(td_limpieza);}
            if (item.category === parseInt(table_body_row_alquiler.dataset.category)) { let td_alquiler = document.createElement("td");td_alquiler.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alquiler.append(td_alquiler);}
        })
        data.november.forEach(item => { 
            if (item.category === parseInt(table_body_row_apps.dataset.category)) { let td_apps = document.createElement("td"); td_apps.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_apps.append(td_apps);}
            if (item.category === parseInt(table_body_row_servicios.dataset.category)) { let td_serv = document.createElement("td"); td_serv.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_servicios.append(td_serv);}
            if (item.category === parseInt(table_body_row_otros.dataset.category)) { let td_otros = document.createElement("td");td_otros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_otros.append(td_otros);}
            if (item.category === parseInt(table_body_row_alimentos.dataset.category)) { let td_alimentos = document.createElement("td");td_alimentos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alimentos.append(td_alimentos);}
            if (item.category === parseInt(table_body_row_suplementos.dataset.category)) { let td_suplementos = document.createElement("td");td_suplementos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_suplementos.append(td_suplementos);}
            if (item.category === parseInt(table_body_row_cuid_pers.dataset.category)) { let td_cuid_pers = document.createElement("td");td_cuid_pers.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_cuid_pers.append(td_cuid_pers);}
            if (item.category === parseInt(table_body_row_seguros.dataset.category)) { let td_seguros = document.createElement("td");td_seguros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_seguros.append(td_seguros);}
            if (item.category === parseInt(table_body_row_limpieza.dataset.category)) { let td_limpieza = document.createElement("td");td_limpieza.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_limpieza.append(td_limpieza);}
            if (item.category === parseInt(table_body_row_alquiler.dataset.category)) { let td_alquiler = document.createElement("td");td_alquiler.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alquiler.append(td_alquiler);}
        })
        data.december.forEach(item => { 
            if (item.category === parseInt(table_body_row_apps.dataset.category)) { let td_apps = document.createElement("td"); td_apps.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_apps.append(td_apps);}
            if (item.category === parseInt(table_body_row_servicios.dataset.category)) { let td_serv = document.createElement("td"); td_serv.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`; table_body_row_servicios.append(td_serv);}
            if (item.category === parseInt(table_body_row_otros.dataset.category)) { let td_otros = document.createElement("td");td_otros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_otros.append(td_otros);}
            if (item.category === parseInt(table_body_row_alimentos.dataset.category)) { let td_alimentos = document.createElement("td");td_alimentos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alimentos.append(td_alimentos);}
            if (item.category === parseInt(table_body_row_suplementos.dataset.category)) { let td_suplementos = document.createElement("td");td_suplementos.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_suplementos.append(td_suplementos);}
            if (item.category === parseInt(table_body_row_cuid_pers.dataset.category)) { let td_cuid_pers = document.createElement("td");td_cuid_pers.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_cuid_pers.append(td_cuid_pers);}
            if (item.category === parseInt(table_body_row_seguros.dataset.category)) { let td_seguros = document.createElement("td");td_seguros.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_seguros.append(td_seguros);}
            if (item.category === parseInt(table_body_row_limpieza.dataset.category)) { let td_limpieza = document.createElement("td");td_limpieza.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_limpieza.append(td_limpieza);}
            if (item.category === parseInt(table_body_row_alquiler.dataset.category)) { let td_alquiler = document.createElement("td");td_alquiler.innerHTML = `${parseInt(item.categ_sum).toFixed(0)}`;table_body_row_alquiler.append(td_alquiler);}
        })
        // main append to table of body elements
        table.append(table_body, table_body_row_apps, table_body_row_servicios, table_body_row_otros, table_body_row_alimentos, table_body_row_suplementos, table_body_row_cuid_pers, table_body_row_seguros, table_body_row_limpieza, table_body_row_alquiler, table_body_row_total)
    })
    .catch(error => console.log(error))
}

// onchange function
function transactions_onchange() {
    let button = document.querySelector("#toggle-transacciones-resumen")
    document.querySelector("#select-transaction-month").addEventListener('change', () => {
        if (button.value === "Resumen mensual") {
            load_transactions()
        } else summary_month();
    })
    document.querySelector("#select-transaction-year").addEventListener('change', () => {
        if (button.value === "Transacciones del mes") {
            summary_month();
        } else load_transactions()
    })
    document.querySelector("#select-summary-year").addEventListener('change', () => {
        general_summary();
        createGraph();
    })
}

// toggle button
function toggle_transaction_summary() {
    let button = document.querySelector('#toggle-transacciones-resumen')
    // clicking the button, toggles between summary and transactions
    button.addEventListener('click', (event) => {
        event.preventDefault();
        if (button.value === "Resumen mensual") {
            button.value = "Transacciones del mes"
            document.querySelector("#table-summary-month-transactions").style.display = "block";
            document.querySelector("#table-transactions").style.display = "none";
            document.querySelector("#newTransaction").style.display = "none";
            summary_month()
            return
        } else if (button.value === "Transacciones del mes") {
            button.value = "Resumen mensual"
            document.querySelector("#table-summary-month-transactions").style.display = "none";
            document.querySelector("#table-transactions").style.display = "block";
            document.querySelector("#newTransaction").style.display = "block";
            load_transactions()
            return
        }
    })
}

// get summary per month, loads only when calling toggle_transaction_summary() function
function summary_month() {
    // erase previous loads and display none for transactions
    document.querySelector("#table-summary-month-transactions").innerHTML = "";
    const error = document.querySelector("#error-selection");
    error.style.display = "none";
    // get selected month and year
    let value_month = document.querySelector("#select-transaction-month").value;
    let value_year = document.querySelector("#select-transaction-year").value;
    fetch(`/summary_month/date?month=${value_month}&year=${value_year}`)
    .then(response => response.json())
    .then(data => {
        // Show title for selected month and year
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const month_title = document.querySelector("#transaction-month")
        month_title.innerHTML = `<h3>Año ${value_year} </br> Mes ${monthNames[value_month - 1]} </h3>`
        // if no data available stop
        if (data.summary.sum_cat.length === 0) {
            error.style.display = "block";
            error.innerHTML = "No existe información para el mes y año seleccionado"
            return
        }
        // create budget dict and push values for each budget data by category
        const budget_dict = {}
        for (let i = 0; i < data.summary.budget.length; i++) {
            let entry = data.summary.budget[i];
            if (!budget_dict[entry.category]) {
                budget_dict[entry.category]
            }
            budget_dict[entry.category] = entry.amount;
        }
        // create table head and table body and append to table
        let table_thead = document.createElement("thead")
        table_thead.innerHTML = `<tr>
                                    <th scope="col">Categoria</th>
                                    <th scope="col">Monto</th>
                                    <th scope="col">Presupuesto</th>
                                    <th scope="col">Diferencia</th>
                                </tr>`
        let table_tbody = document.createElement("tbody")
        document.querySelector("#table-summary-month-transactions").append(table_thead, table_tbody)
        data.summary.sum_cat.forEach(category => { 
            // creation of each element of the table and set each category inside data.categories for auto match with category
            let category_result = budget_dict[category.category] - category.categ_sum
            let table_tbody_trow = document.createElement("tr")
            table_tbody_trow.innerHTML = `  <td>${data.categories[category.category]}</td>
                                            <td>${category.categ_sum}</td>
                                            <td>${parseInt(budget_dict[category.category]).toFixed(0)}</td>
                                            <td class="${budget_dict[category.category] >= category.categ_sum ? "table-success" : "table-danger"}">${category_result.toFixed(2)}</td>
                                  `
            table_tbody.appendChild(table_tbody_trow)
        })
        // add row for total amount
        let total_result = parseInt(data.total_budget_month - data.total_month)
        let total_trow = document.createElement("tr")
        total_trow.innerHTML = ` <td>Total</td>
                                <td>${parseInt(data.total_month).toFixed(2)}</td>
                                <td>${parseInt(data.total_budget_month)}</td>
                                <td class="${parseInt(data.total_budget_month) >= parseInt(data.total_month) ? "table-success" : "table-danger"}">${total_result.toFixed(2)}</td>`
        table_tbody.appendChild(total_trow)
    })
    .catch(error => console.log(error))
}

// load all transactions per user
function load_transactions(month, year) {
    // dissapear error selection message & table of transactions
    document.querySelector("#table-transactions").innerHTML = "";
    const error = document.querySelector("#error-selection")
    error.style.display = "none";
    // get selected month and year
    let value_month = document.querySelector("#select-transaction-month").value;
    let value_year = document.querySelector("#select-transaction-year").value;
    fetch(`/load_transactions/date?month=${month ? month : value_month}&year=${year ? year : value_year}`)
        .then(response => response.json())
        .then(data => { 
            // Show title for selected month and year
            const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            const month_title = document.querySelector("#transaction-month")
            month_title.innerHTML = `<h3>Año ${year ? year : value_year} </br> Mes ${month ? monthNames[month -1] : monthNames[value_month - 1]} </h3>`
            // check if there is data for selected month and year
            if (data.transaction.length === 0) {
                error.style.display = "block";
                error.innerHTML = "No existe información para el mes y año seleccionado";
                return;
            }
            // creation of thead and tbody (1 of a kind elements)
            let table_thead = document.createElement("thead");
            table_thead.innerHTML = `<tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Dia</th>
                                        <th scope="col">Categoria</th>
                                        <th scope="col">Descripción</th>
                                        <th scope="col">Monto</th>
                                        <th scope="col">Fecha de modificación</th>
                                    </tr>`;
            let table_tbody = document.createElement("tbody");
            document.querySelector("#table-transactions").append(table_thead, table_tbody);
            // loop for each transaction
            data.transaction.forEach(transaction => {
                // transform into new Date() variable
                let d = new Date(transaction.date);
                let day = d.getDate();
                // creation of each element of the table
                let table_tbody_trow = document.createElement("tr");
                table_tbody_trow.setAttribute('id', `selected${transaction.id}`);
                table_tbody_trow.innerHTML = `  <th scope="row">${transaction.id}</th>
                                                <td id='day${transaction.id}'>${day}</td>
                                                <td id='category${transaction.id}'>${transaction.category}</td>
                                                <td id='description${transaction.id}'>${transaction.description}</td>
                                                <td id='amount${transaction.id}'>${transaction.amount}</td>
                                                <td id='input${transaction.id}'>${transaction.input_date}</td>
                                                <td id='erase${transaction.id}'><a href='#' class='btn btn-secondary'>Eliminar</a></td>
                                                <td id='edit${transaction.id}'><button type='button' class='btn btn-secondary' data-bs-toggle='modal' data-bs-target='#edit-transaction'>Editar</button></td>
                                                `;
                table_tbody.appendChild(table_tbody_trow);
                // activate deleting function when clicking button Eliminar
                document.querySelector(`#erase${transaction.id}`).onclick = function(event) {
                    event.preventDefault(); 
                    if(confirm("¿Estás seguro de eliminar la transacción?") == true) {
                        eraseTransactions(transaction.id)
                    } else (close())
                }
                // activate editing function when clicking button Editar
                document.querySelector(`#edit${transaction.id}`).onclick = function(event) { 
                    event.preventDefault();
                    // first get method when loading modal
                    fetch(`/update_transaction/${transaction.id}`)
                        .then(response => response.json())
                        .then(data => {
                            // get data for ddate, category, description, amount
                            let date = data.date;
                            let category = data.category
                            let description = data.transaction.description;
                            let amount = data.transaction.amount;
                            // get id from elements
                            document.querySelector("#update-date").value = date;
                            document.querySelector("#update-category").value = category;
                            document.querySelector("#update-description").value = description;
                            document.querySelector("#update-amount").value = amount;
                        })
                        .catch(error => console.log(error))
                    }
                // update when clicking actualizar button - post method 
                document.querySelector("#update-button").onclick = function(event) {
                    event.preventDefault();
                    updateTransaction(transaction.id)
                }
            })
        })
        .catch(error => console.log(error))
        return false;
}


function updateTransaction(id) {
    // get data from form
    const update_date = document.querySelector("#update-date").value
    const update_category = document.querySelector("#update-category").value
    const update_description = document.querySelector("#update-description").value
    const update_amount = document.querySelector("#update-amount").value
    // get csrf token from django template {% csrf_token %}
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // make post to backend
    fetch(`/update_transaction/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        mode: 'same-origin',
        body: JSON.stringify({
            date: update_date,
            category: update_category,
            description: update_description,
            amount: update_amount
        })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            //load_transactions(data.month, data.year)
            // select row id and update inner html elements (date, category, description, amount, input) example id date${id}
            document.querySelector(`#day${data.transaction.id}`).innerHTML = data.day
            document.querySelector(`#category${data.transaction.id}`).innerHTML = data.transaction.category
            document.querySelector(`#description${data.transaction.id}`).innerHTML = data.transaction.description
            document.querySelector(`#amount${data.transaction.id}`).innerHTML = data.transaction.amount
            document.querySelector(`#input${data.transaction.id}`).innerHTML = data.transaction.input_date
        })
        .catch(error => console.log(error))
        return false;
}


function eraseTransactions(id) {
    // get csrf token from django template {% csrf_token %}
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    fetch(`/delete_transaction/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        mode: 'same-origin',
        body: JSON.stringify({
          transaction_id: id
        })
      })
      .then(response => response.json())
      .then(data => {
            document.querySelector(`#selected${id}`).innerHTML = "";
    })
      .catch(error => console.log(error))
      return false;
}


