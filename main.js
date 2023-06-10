let books = [];
let menus = document.querySelectorAll(".menus button");
let summary = '';

menus.forEach((menu) => menu.addEventListener("click", (event) => getBooksBySubject(event)));

let searchButton = document.getElementById("search-button");
console.log("버튼은?", searchButton);


const getBookLists = async () => {
    let url = new URL(`https://www.googleapis.com/books/v1/volumes?q=subject:business&startIndex=0&filter=full`);
    let response = await fetch(url);

    let data = await response.json();
    console.log(data);
    books = data.items;

    render();
}

const getBooksBySubject = async (event) => {

    let subject = event.target.textContent.toLowerCase();
    let url = new URL(`https://www.googleapis.com/books/v1/volumes?q=subject:${subject}&startIndex=0&filter=full`);

    let response = await fetch(url);
    let data = await response.json();

    books = data.items;

    render();
}

const getBooksByKeyword = async () => {
    //검색한 Keyword를 가지고 옴
    let keyword = document.getElementById("input-text").value;

    let url = new URL(`https://www.googleapis.com/books/v1/volumes?q=${keyword}&startIndex=0&filter=full`);
    let response = await fetch(url);

    let data = await response.json();
    books = data.items;

    render();
}

const render = () => {
    let booksHTML = ``;
    booksHTML = books.map(books=>{
        // 해당 책에 description 이 있는지 확인
        if (books.volumeInfo.description == null){
            summary = 'No description found in this book'
        } else{
            summary = books.volumeInfo.description;
        }

        if (books.volumeInfo.authors == null){
            author = 'No authors found in this book'
        } else{
            author = books.volumeInfo.authors;
        }
        
        // description 글자가 500이 넘으면 나머지는 생략처리
        if (summary.length > 500){
            summary = summary.substring(0,500) + "..."
        }
       
        return `<div class="row books">
        <div class="col-lg-3">
            <img class="books-img-size" src = "${books.volumeInfo.imageLinks.thumbnail}"/>
        </div>
        <div class="col-lg-9">
            <ol type="I"></ol>
                <li><b>『 ${books.volumeInfo.title} 』</b></li>
                <li>Author : ${author}</li>
                <li>Publish date : ${books.volumeInfo.publishedDate}</li>
                <li>pages : ${books.volumeInfo.pageCount}</li>
                <li>Summary </li>
                    <p>${summary}</p>
                <li><button type="button" class="btn btn-outline-secondary" onclick="window.open('${books.volumeInfo.previewLink}')">Preview-Link</button></li>
        </div>
    </div>`;
    }).join('');

    document.getElementById("books-board").innerHTML = booksHTML;
}

searchButton.addEventListener("click", getBooksByKeyword);
getBookLists();