let books = [];
let menus = document.querySelectorAll(".menus button");
let summary = '';
let url = '';
let booksHTML = '';

menus.forEach((menu) => menu.addEventListener("click", (event) => getBooksBySubject(event)));

let searchButton = document.getElementById("search-button");

const getBooks = async () => {
    try{
      
        let response = await fetch(url);
        let data = await response.json();
        console.log("서버응답값은?", response.status);
        if(response.status == 200){
            if(data.totalItems == 0){
                throw new Error("검색 된 결과값이 없습니다!!!");
            }else{
                books = data.items;
                console.log("data는: ", books);
                render();
            }
        }else{
            //검색 창에 아무것도 입력하지 않고 Search 를 할경우
            if(response.status == 400){
                throw new Error("검색어를 입력하세요!!!");
            } else{
            throw new Error(data.message);
            }
        }
        
    }catch(error){
        console.log("잡힌 에러 : ", error.message);
        errorRender(error.message);
    }
    
}


const getBookLists = async () => {
    url = new URL(`https://www.googleapis.com/books/v1/volumes?q=subject:business&startIndex=0&filter=full`);
    getBooks();
}

const getBooksBySubject = async (event) => {

    let subject = event.target.textContent.toLowerCase();

    url = new URL(`https://www.googleapis.com/books/v1/volumes?q=subject:${subject}&startIndex=0&filter=full`);
    getBooks();
}


const getBooksByKeyword = async () => {
    //검색한 Keyword를 가지고 옴
    let keyword = document.getElementById("input-text").value;

    url = new URL(`https://www.googleapis.com/books/v1/volumes?q=${keyword}&startIndex=0&filter=full`);
    getBooks();
}


const render = () => {
    //let booksHTML = ``;
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

const errorRender = (message) => {
    let errorHTML = `<div class="alert alert-primary text-center" role="alert">
    ${message}
  </div>`;
    document.getElementById("books-board").innerHTML = errorHTML;
}

searchButton.addEventListener("click", getBooksByKeyword);
getBookLists();