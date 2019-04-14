var extrude = [
    'gender',
    'mass',
    'height',
    'age',
    'activity',
    'target',
    'eatenP',
    'eatenC',
    'eatenF',
    'simC',
    'simP',
    'simF',
    'date',
    'history',
    'bmr'
];

var autocomplete_array = [];
var json_string = "";

var today_date = today_is_string();
console.log(today_date);


show_div('calories');

(($) => {
    $(() => {
        refresh_select();

        if (localStorage.getItem('date') != null && localStorage.getItem('date') !== today_date) {
            localStorage.setItem('date', today_date);
            localStorage.setItem('simP', '0');
            localStorage.setItem('simF', '0');
            localStorage.setItem('simC', '0');
            localStorage.setItem('eatenP', '0');
            localStorage.setItem('eatenF', '0');
            localStorage.setItem('eatenC', '0');
        }

        $('#click_calories').click(() => {
            show_div('calories');
            return false;
        });
        $('#click_product').click(() => {
            show_div('product');
            return false;
        });
        $('#click_bmr').click(() => {
            show_div('new_bmr');
            return false;
        });
        $('#click_history').click(() => {
            show_div('history');
            return false;
        });

        $('#click_json').click(() => {
            show_div('json');
            return false;
        });

        $('#json_add').click(() => {
            var json_text_input = "";

            var json_object = JSON.parse(json_text_input);

            $.each(json_object.product_keys, (i, item) => {
                if (!extrude.includes(item) && !Object.keys(localStorage).includes(item)) {
                    localStorage.setItem(item, json_object.product_values[i]);
                }

            });
            refresh_select();

            return false;
        });


        $('#add_product').click(() => {
            var code = $('#boxPCode').val();
            var name = $('#boxPName').val();
            var protein = $('#boxPProtein').val();
            var carbo = $('#boxPCarbo').val();
            var fat = $('#boxPFat').val();
            var count = $('#boxPCount').val();
            var portion = $('#boxPPortion').val();

            if (name !== '') {
                var modifier = 1.0;

                if (portion !== count) {
                    modifier = (portion / count);
                }
                const ob = {
                    'proteins': (protein * 4.0) * modifier,
                    'fats': (fat * 9.0) * modifier,
                    'carbs': (carbo * 4.0) * modifier,
                    'portion': portion,
                    'code':code
                };
                localStorage.setItem(name, JSON.stringify(ob));

                $('#boxPName').val('');
                $('#boxPProtein').val(0);
                $('#boxPCarbo').val(0);
                $('#boxPFat').val(0);
                $('#boxPCount').val(100);
                $('#boxBPortion').val(100);
                refresh_select();
            }

            return false;
        });

        $('#calc_bmr').click(() => {
            var gender_value = $('#selectGender').val();
            var gender = 5;
            if (parseInt(gender_value) === 1)
                gender = 5;
            else
                gender = -161;
            //var plec = $('#bmr_plec').val();
            var mass = $('#boxMass').val();
            var height = $('#boxHeight').val();
            var age = $('#boxAge').val();
            var activity = $('#selectActivity').val();
            var target = $('#selectTarget').val();
            localStorage.setItem('gender', gender);
            localStorage.setItem('mass', mass);
            localStorage.setItem('height', height);
            localStorage.setItem('age', age);
            localStorage.setItem('activity', activity);
            localStorage.setItem('target', target);
            localStorage.setItem('eatenP', 0);
            localStorage.setItem('eatenC', 0);
            localStorage.setItem('eatenF', 0);
            localStorage.setItem('simP', 0);
            localStorage.setItem('simF', 0);
            localStorage.setItem('simC', 0);
            localStorage.setItem('date', today_is_string());
            history_create();

            var bmr = (9.99 * mass) + (6.25 * height) - (4.92 * age) + gender;
            var cpm = bmr * activity;
            var fbmr = round_f(cpm + parseInt(target), 3);
            console.log("LOG: " + (fbmr));

            localStorage.setItem('bmr', fbmr);
            refresh_charts();
            show_div('calories');

            return false;
        });

        $('#add_calories').click(() => {
            var product = $('#inputSearch').val();
            var count = $('#inputCount').val();
            var grams = $('#radioGrams').prop('checked');
            var simulator = $('#checkSim').prop('checked');
            var clear = $('#checkClear').prop('checked');

            if (clear) {
                if (simulator) {
                    localStorage.setItem('simP', localStorage.getItem('eatenP'));
                    localStorage.setItem('simF', localStorage.getItem('eatenF'));
                    localStorage.setItem('simC', localStorage.getItem('eatenC'));
                } else {
                    localStorage.setItem('simP', '0');
                    localStorage.setItem('simF', '0');
                    localStorage.setItem('simC', '0');
                    localStorage.setItem('eatenP', '0');
                    localStorage.setItem('eatenF', '0');
                    localStorage.setItem('eatenC', '0');
                    history_set(today_date, 0, 0, 0);
                }
            } else {
                var json_product = JSON.parse(localStorage.getItem(product));
                var mod = 1;
                if (grams) //gramy
                {
                    mod = count / json_product.portion;
                } else {
                    mod = count;
                }

                var proteins = json_product.proteins * mod;
                var fats = json_product.fats * mod;
                var carbs = json_product.carbs * mod;

                var ap = parseFloat(localStorage.getItem('eatenP'));
                var af = parseFloat(localStorage.getItem('eatenF'));
                var ac = parseFloat(localStorage.getItem('eatenC'));
                var sp = parseFloat(localStorage.getItem('simP'));
                var sf = parseFloat(localStorage.getItem('simF'));
                var sc = parseFloat(localStorage.getItem('simC'));

                if (simulator) {
                    localStorage.setItem('simP', sp + proteins);
                    localStorage.setItem('simF', sf + fats);
                    localStorage.setItem('simC', sc + carbs);
                } else {
                    localStorage.setItem('eatenP', ap + proteins);
                    localStorage.setItem('eatenF', af + fats);
                    localStorage.setItem('eatenC', ac + carbs);

                    history_set(today_date, ap + proteins, ac + carbs, af + fats);

                    localStorage.setItem('simP', ap + proteins);
                    localStorage.setItem('simF', af + fats);
                    localStorage.setItem('simC', ac + carbs);
                }
            }

            history_set(today_is_string(), localStorage.getItem('eatenP'), localStorage.getItem('eatenC'), localStorage.getItem('eatenF'));

            $('#checkClear').prop('checked', false);
            $('#checkSim').prop('checked', false);
            $('#inputCount').val(0);
            refresh_charts();
            return false;
        });
        if (localStorage.getItem('date') !== null) {
            refresh_charts();
        }

    }); // end of document ready
})(jQuery); // end of jQuery name space


/*
plec
masa
wzrost
wiek
aktywnosc
cel
zjedzoneB
zjedzoneT
zjedzoneW
simB
simT
simW
data

 */

function refresh_charts() {
    drawChart(localStorage.getItem('bmr'), localStorage.getItem('eatenP'), localStorage.getItem('eatenC'), localStorage.getItem('eatenF'), (localStorage.getItem('bmr') - localStorage.getItem('cel')), 0, localStorage.getItem('simP'), localStorage.getItem('simC'), localStorage.getItem('simF'));

    var history_json = JSON.parse(localStorage.getItem('history'));
    drawHistoryChart(history_json.dates, history_json.alls);
    drawHistoryChart1(history_json.dates, history_json.proteins, history_json.carbs, history_json.fats);
}

function round_f(n, k) {
    var factor = Math.pow(10, k);
    return Math.round(n * factor) / factor;
}

function today_is_string() {
    return new Date().toISOString().slice(0, 10);
}

function show_div(name) {
    $('#calories').hide();
    $('#product').hide();

    $('#history').hide();
    $('#json').hide();

    if (localStorage.getItem('date') !== null) {
        $('#new_bmr').hide();
        $('#' + name).show();
    } else {
        $('#new_bmr').show();
    }

}

function refresh_select() {
    //$('#kalorie_produkt').empty();
    autocomplete_array = [];
    $.each(Object.keys(localStorage), (i, item) => {
        if (!extrude.includes(item)) {

            console.log("ADD "+item);
            autocomplete_array.push(item);
        }

    });

    $('input.autocomplete').autocomplete({
        source: autocomplete_array
    });
}


function drawChart(bmr, ep, ec, ef, base, chartIndex, simP, simC, simF) {
    var proteins = ((15.0 / 100.0) * bmr) | 0;
    var carbs = ((55.0 / 100.0) * bmr) | 0;
    var fats = ((30.0 / 100.0) * bmr) | 0;
    var eaten = (parseInt(ep, 10) + parseInt(ec, 10) + parseInt(ef, 10));
    var percent = ((eaten / bmr) * 100.0) | 0;

    var nextMess = "";

    if (eaten < base) {
        nextMess = "(zjadłeś za mało)";
    } else if (eaten >= bmr) {
        nextMess = "(Udało ci się zjeść całe dzienne zapotrzebowanie)";
    } else {
        nextMess = "(zjedz jeszcze trochę)";
    }
    var ctx = document.getElementById("myChart" + chartIndex);
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["Białka", "Węglowodany", "Tłuszcze"],
            datasets: [{
                label: 'Zjedzone',
                data: [ep, ec, ef],
                //backgroundColor: 'rgba(255, 99, 132, 1)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            },
                {
                    label: 'Zapotrzebowanie',
                    data: [proteins, carbs, fats],
                    //backgroundColor: 'rgba(54, 162, 235, 1)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Symulator',
                    data: [simP, simC, simF],
                    borderColor: 'rgba(255, 205, 86, 1)',
                    borderWidth: 1
                }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            responsive: true,
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Zjadłeś ' + (eaten) + 'kcal z ' + bmr + 'kcal' + nextMess + " " + percent + "%"
            }
        },
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1
    });
}

function drawHistoryChart(dates, alls) {
    var ctx = document.getElementById("myChartHistory");
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Zjedzone kalorie',
                data: alls,
                //backgroundColor: 'rgba(255, 99, 132, 1)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            responsive: true,
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: "Historia"
            }
        }
    });

    //drawHistoryChart1(daty,bialka,wegle,tluszcze,razem,chartIndex);
}

function drawHistoryChart1(dates, proteins, carbs, fats) {
    //rgba(75, 192, 192, 1)
    //rgba(255, 99, 132, 1)
    //rgba(54, 162, 235, 1)
    var ctx = document.getElementById("myChartHistory1");
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Białka',
                data: proteins,
                backgroundColor: 'rgba(255, 99, 132, 1)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            },
                {
                    label: 'Węglowodany',
                    data: carbs,
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Tłuszcze',
                    data: fats,
                    backgroundColor: 'rgba(54, 162, 235, 1)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            responsive: true,
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: "Historia"
            }
        }
    });
}


function history_create() {
    const history_json = {
        'dates': [today_is_string()],
        'proteins': [0],
        'carbs': [0],
        'fats': [0],
        'alls': [0]
    }

    localStorage.setItem('history', JSON.stringify(history_json));
}

function history_set(date, proteins, carbs, fats) {
    var history_json = JSON.parse(localStorage.getItem(('history')));

    var index = -1;
    for (var a = 0; a < history_json.dates.length; a++) {
        if (history_json.dates[a] === date) {
            index = a;
            break;
        }
    }

    if (index === -1) {
        if (history_json.dates.length === 14) {
            history_json.dates.pop();
            history_json.proteins.pop();
            history_json.carbs.pop();
            history_json.fats.pop();
            history_json.alls.pop();

        }

        history_json.dates.push(date);
        history_json.proteins.push(proteins);
        history_json.carbs.push(carbs);
        history_json.fats.push(fats);
        history_json.alls.push(parseFloat(proteins) + parseFloat(carbs) + parseFloat(fats));
    } else {
        history_json.proteins[index] = parseFloat(proteins);
        history_json.carbs[index] = parseFloat(carbs);
        history_json.fats[index] = parseFloat(fats);
        history_json.alls[index] = ((parseFloat(proteins) + parseFloat(carbs) + parseFloat(fats)));
    }

    localStorage.setItem('history', JSON.stringify(history_json));
    drawHistoryChart(history_json.dates, history_json.alls);
    drawHistoryChart1(history_json.dates, history_json.proteins, history_json.carbs, history_json.fats);
}

if (('caches' in window)) {
    // Has support!
    console.log("Support Cache!");
    caches.open('offline').then(cache => {
        console.log("Opened offline Cache");
        cache.add('/FitCalc/index.html');
        cache.add('/FitCalc/bootstrap-4.0.0.css');
        cache.add('/FitCalc/bootstrap-4.0.0.js');
        cache.add('/FitCalc/Chart.js');
        cache.add('/FitCalc/FitCalc.js');
        cache.add('/FitCalc/jQuery.js');
        cache.add('/FitCalc/jQuery-ui.css');
        cache.add('/FitCalc/jQuery-ui.js');
        cache.add('/FitCalc/popper.js');
    });
    console.log("End adding to Cache!");
}

function close_scanner()
{
    Quagga.stop();
}

function open_scanner_addproduct()
{
    open_scanner(data =>
    {
        $('#boxPCode').val(data.codeResult.code);
        close_scanner();
    })
}

function open_scanner_calories()
{
    open_scanner(data =>
    {
        let contains = false;
        let product_name = "";
        $.each(Object.keys(localStorage), (i, item) => {
            if (!extrude.includes(item)) {

                if(localStorage.getItem(item).includes(data.codeResult.code))
                {
                    contains = true;
                    product_name = item;
                }
            }

        });
        if(contains)
        {
            $('#inputSearch').val(product_name);
        }
        else
        {
            alert("Nie znaleziono produktu z danym kodem!");
        }
        close_scanner();

    })
}

function open_scanner(callback)
{
    Quagga.init({
        inputStream: {
            type : "LiveStream",
            constraints: {
                width: {min: 640},
                height: {min: 480},
                facingMode: "environment",
                aspectRatio: {min: 1, max: 2}
            },
            area: { // defines rectangle of the detection/localization area
                top: "0%",    // top offset
                right: "0%",  // right offset
                left: "0%",   // left offset
                bottom: "0%"  // bottom offset
            }
        },
        locator: {
            patchSize: "medium",
            halfSample: true
        },
        numOfWorkers: 4,
        frequency: 10,
        decoder: {
            readers : [{
                format: "ean_reader",
                config: {}
            }]
        },
        locate: true

    }, function(err) {
        if (err) {
            console.log(err);
            return
        }
        console.log("Initialization finished. Ready to start");



        Quagga.start();

        Quagga.onDetected(data => {
            callback(data);
            $("[data-dismiss=modal]").trigger({ type: "click" });
        });
    });
}


