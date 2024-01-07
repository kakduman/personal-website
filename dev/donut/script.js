document.addEventListener('DOMContentLoaded', function() {
    var ctx = document.getElementById("donut-chart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [
                "EU Hosting Expenses",
                "US Hosting Expenses",
                "Other Hosting Expenses",
                "Client Reimbursements",
                "Sustainability Fund Contributions",
                "Product Research",
                "Hosting Revenue",
                "Charitable Donations"
            ],
            datasets: [{
                // Outer Ring (EXPENDITURES)
                label: "Total (USD)",
                backgroundColor: [
                    'rgba(255, 0, 0, 0.2)', // EU Hosting Expenses pink
                    'rgba(255, 40, 0, 0.2)', // US Hosting Expenses red-red
                    'rgba(255, 80, 0, 0.2)', // Other Hosting Expenses magenta-ish
                    'rgba(255, 120, 0, 0.2)', // Client Reimbursements yellow
                    'rgba(255, 160, 0, 0.2)', // Sustainability Fund orange
                    'rgba(255, 200, 0, 0.2)', // Market Research red
                    'rgba(0, 200, 0, 0.2)',
                    'rgba(0, 200, 100, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 0, 0, 1)', // EU Hosting Expenses pink
                    'rgba(255, 40, 0, 1)', // US Hosting Expenses red-red
                    'rgba(255, 80, 0, 1)', // Other Hosting Expenses magenta-ish
                    'rgba(255, 120, 0, 1)', // Client Reimbursements yellow
                    'rgba(255, 160, 0, 1)', // Sustainability Fund orange
                    'rgba(255, 200, 0, 1)', // Market Research red
                    'rgba(0, 200, 0, 1)',
                    'rgba(0, 200, 100, 1)'
                ],
                borderWidth: 1,
                data: [436.20, 301.53, 56.4, 206.8, 2500, 300, null, null] // Only three values for outer ring
            },
            {
                label: "Total (USD)",
                // Assuming these are for the inner donut (Sustainability Fund)
                backgroundColor: [
                    'rgba(235, 100, 100, 0.2)',
                    'rgba(255, 0, 0, 0.2)',
                    'rgba(255, 0, 100, 0.2)',
                    'rgba(235, 162, 54, 0.2)',
                    'rgba(256, 100, 0, 0.2)',
                    'rgba(256, 20, 0, 0.2)',
                    'rgba(0, 200, 0, 0.2)',
                    'rgba(0, 200, 100, 0.2)'
                ],
                borderColor: [
                    'rgba(235, 100, 100, 1)',
                    'rgba(255, 0, 0, 1)',
                    'rgba(255, 0, 100, 1)',
                    'rgba(235, 162, 54, 1)',
                    'rgba(256, 100, 0, 1)',
                    'rgba(256, 20, 0, 1)',
                    'rgba(0, 200, 0, 1)',
                    'rgba(0, 200, 100, 1)'
                ],
                borderWidth: 1,
                data: [null, null, null, null, null, null, 1034.89, 2866.31] // Only three values for outer ring
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutoutPercentage: 50, // Adjust for larger or smaller hole
            tooltips: {
                enabled: true
            },
            plugins:
            {
                legend:
                {
                    display: true,
                    position: 'top',
                }
            }
        }
    });
});




// document.addEventListener('DOMContentLoaded', function() {
//     var ctx = document.getElementById("donut-chart").getContext('2d');
//     var myChart = new Chart(ctx, {
//         type: 'doughnut',
//         data: {
//             labels: ["Hosting Revenue", "Charitable Donations"],
//             datasets: [{
//                 label: 'Total (USD)',
//                 data: [1034.89, 2500],
//                 backgroundColor: [
//                     'rgba(54, 162, 235, 0.2)', // Blue
//                     'rgba(255, 206, 86, 0.2)'  // Yellow
//                 ],
//                 borderColor: [
//                     'rgba(54, 162, 235, 1)',
//                     'rgba(255, 206, 86, 1)'
//                 ],
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             cutoutPercentage: 80
//         }
//     });
// });
