let filterList;
let newsItems;

window.initNewsList = function () {
    filterList = document.querySelector('#news_box .filter');
    newsItems = document.querySelectorAll('#news_box .news');
    const filterButtons = filterList.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');

            if (!document.startViewTransition) {
                updateActiveButton(button);
                filterNews(filter);
                return;
            }

            document.startViewTransition(() => {
                updateActiveButton(button);
                filterNews(filter);
            });
        });
    });
};

function updateActiveButton(newButton) {
    filterList.querySelector('.active')?.classList.remove('active');
    newButton.classList.add('active');
}

function filterNews(newsFilter) {
    newsItems.forEach(item => {
        const category = item.getAttribute('data-category');

        if (newsFilter === 'all' || newsFilter === category) {
            item.removeAttribute('hidden');
        } else {
            item.setAttribute('hidden', '');
        }
    });
}