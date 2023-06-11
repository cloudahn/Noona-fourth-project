let books = [];
let menus = document.querySelectorAll(".menus button");
let summary = '';
let url = '';
let booksHTML = '';
let call_index = 0;
let max_return = -1;

//pagination 관련 전역변수
let total_items = 0; //검색 된 전체 건수
let total_pages = 0; //10개로 나누어진 전체 화면 페이지 수 (/10)
let total_page_groups = 0; // Pagination 을 위한 전체 페이지 그룹(/5) 
let current_page_group = 1; //현재 화면의 페이지가 속한 페이지 그룹
let first_page = 1 // 현재 그룹의 첫번째 페이지
let last_page = 0; // 현재 그룹의 마지막 페이지
let current_page = 1; //현재 페이지의 그룹 번호


menus.forEach((menu) => menu.addEventListener("click", (event) => getBooksBySubject(event)));

let searchButton = document.getElementById("search-button");

const getBooks = async () => {
    try{
      
        url.searchParams.set("startIndex", call_index); // 원하는 페이지의 index 값을 파라메터로 넣는다. &startIndex=
        url.searchParams.set("langRestrict", "en");
        let response = await fetch(url);
        let data = await response.json();
        
        total_items = data.totalItems;
        
        //구글 API 키워드 검색 결과 리터값 오류로 인해 최초 리턴된 검색 건수를 Fix 시킴
        if (max_return == -1){
            max_return = data.totalItems
        } else{
            if (max_return <= total_items){
                total_items = max_return;
            }
        }
         //검색 된 전체 건수를 total_page 입력
        total_pages = Math.ceil(total_items/10);
        current_page_group = Math.ceil(current_page/5) //현재페이지가 속해있는 페이지 그룹

        if(response.status == 200){
            //검색 된 결과가 없을 경우 결과 없음을 출력
            if(total_items == 0){    
                throw new Error("검색 된 결과값이 없습니다!!!");
         
            }else{
                books = data.items;
                render();
                pagination();
            }
        }else{
            //검색 창에 아무것도 입력하지 않고 Search 를 한 경우
            if(response.status == 400){
                throw new Error("검색어를 입력하세요!!!");
            } else{
            throw new Error(data.message);
            }
        }
        
    }catch(error){
        
        document.querySelector(".pagination").innerHTML = '';
        errorRender(error.message);
    }
    
}


const getBookLists = async () => {
    url = new URL(`https://www.googleapis.com/books/v1/volumes?q=subject:business&filter=full`);
    getBooks();
}

const resetPaging = () => {
    call_index = 0;
    current_page = 1;
    max_return = -1;
}

const getBooksBySubject = async (event) => {
    //클릭한 Subject 정보를 가지고 옴
    let subject = event.target.textContent.toLowerCase();
    resetPaging();
    url = new URL(`https://www.googleapis.com/books/v1/volumes?q=subject:${subject}&filter=full`);

    getBooks();
}


const getBooksByKeyword = async () => {
    //검색한 Keyword를 가지고 옴
    let keyword = document.getElementById("input-text").value;
    resetPaging();

    url = new URL(`https://www.googleapis.com/books/v1/volumes?q=${keyword}&filter=full`);
    getBooks();
}


const render = () => {
    
    booksHTML = books.map(books=>{
        // 해당 책에 description 정보가 있는지 확인 
        if (books.volumeInfo.description == null){
            summary = '<font color = red>No description found in this book</font>'
        } else{
            summary = books.volumeInfo.description;
        }
        // 해당 책에 Author 정보가 있는지 확인 
        if (books.volumeInfo.authors == null){
            author = '<font color = red>No authors found in this book</font>'
        } else{
            author = books.volumeInfo.authors;
        }
        
        // description 글자수가 500자가 넘으면 나머지는 생략처리
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

//Error 메시지를 받아서 화면에 보여주는 함수
const errorRender = (message) => {
    let errorHTML = `<div class="alert alert-primary text-center" role="alert"><font color = grey>
    ${message}</font>
  </div>`;
    document.getElementById("books-board").innerHTML = errorHTML;
}


//검색 된 웹페이지를 페이징 하는 함수
const pagination = () => {

    let paginationHTML = ''; //페이지 네비게이션을 넣어줄 변수

    //전체 페이지 수가 5개 이하일 경우, 즉 1개의 페이지 그룹만 있는 경우
    //이경우 first_page = 1이고, last_page = total_pages 가 된다.
    if (total_pages <= 5){
        total_page_groups = 1;
        current_page_group = 1;
        first_page = 1;
        last_page = total_pages;
    } else{ // 페이지 그룹이 최소 2개 이상 있는 경우
        total_page_groups = Math.ceil(total_pages/5); //페이징할때 5개씩 그룹을 묶을 것임으로
        if((current_page_group*5) >= total_pages ){ // 즉 현재 페이지 그룹이 마지막 페이지 그룹일 경우
            first_page = (current_page_group-1)*5 + 1;
            last_page = total_pages;
        } else{ //마지막 페이지 그룹이 아닌경우
            last_page = current_page_group * 5;
            first_page = last_page - 4;
        }

    }
    
   
    /// 실제로 pagination 을 하는 부분

    if (current_page_group > 1){ //현재 페이지그룹이 첫번째 그룹이 아니면
        paginationHTML = ` <li class="page-item">
        <a class="page-link" href="#" aria-label="Previous" onclick="moveToPage(1)">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>`;
      
      // 내가 그룹1 일때 << < 이 없어야 한다.
      // 마지막 그룹일떄 >> > 이 없어야 한다.
  
        paginationHTML += ` <li class="page-item">
        <a class="page-link" href="#" aria-label="Previous" onclick="moveToPage(${current_page-1})">
          <span aria-hidden="true">&lt;</span>
        </a>
      </li>`;
    }

    for (let i = first_page; i <= last_page; i++ ){
        paginationHTML += `<li class="page-item"><a class="page-link ${(current_page)==i?"active":""}" href="#" onclick="moveToPage(${i})">${i}</a></li>`
    }

    if (current_page_group < total_page_groups){  //현재 페이지가 마지막 페이지 그룹이 아닐경우

        paginationHTML += `<li class="page-item">
        <a class="page-link" href="#" aria-label="Next" onclick="moveToPage(${current_page+1})">
          <span aria-hidden="true">&gt;</span>
        </a>
      </li>`;
  
        paginationHTML += ` <li class="page-item">
          <a class="page-link" href="#" aria-label="Previous" onclick="moveToPage(${total_pages})">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>`;
    }  


    document.querySelector(".pagination").innerHTML = paginationHTML;
}

const moveToPage = (pageNum) => {
    
    call_index = pageNum-1; //이동하고자 하는 페이지를 startIndex(Index 이므로 페이지에 -1을 한다)파라메터로 변환해서 넘긴다
    current_page = pageNum;
    getBooks();

}


searchButton.addEventListener("click", getBooksByKeyword);
getBookLists();