// toggles the navigation menu on mobile view
document.addEventListener('DOMContentLoaded', function () {
    const navButton = document.querySelector('.navbar-toggler');
    const navMenu = document.querySelector('.navigation');

    navButton.addEventListener('click', function () {
        navMenu.classList.toggle('active');
    });
});
