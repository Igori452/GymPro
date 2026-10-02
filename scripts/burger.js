const burgerBtn = document.getElementById('nav__burger__btn');
const darkBack = document.getElementById('nav__burger__background');
const nav = document.getElementById('nav__burger');
const closeBtn = document.getElementById('nav__burger__close');

function showNav () 
{
    darkBack.classList.add('open');
    nav.classList.add('open');
}

function closeNav () 
{
    darkBack.classList.remove('open');
    nav.classList.remove('open');
}

burgerBtn.addEventListener('click', () => {
    showNav();
});

darkBack.addEventListener('click', () => {
    closeNav();
});

closeBtn.addEventListener('click', () => {
    closeNav();
});