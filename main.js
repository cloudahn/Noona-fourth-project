let books = [];
let menus = document.querySelectorAll(".menus button");
let summary = '';
let url = '';
let booksHTML = '';

//pagination 관련 전역변수
let total_hits = 0; //검색 된 전체 아이템수
let total_pages = 0; //전체 페이지 수 ( total_hits / 한페이지당 게시물 수(디폴드 10개) )
let total_page_groups = 0; // 전체 페이지를 페이지 그룹으로 나눈 그룹 수( total_pages / 페이지네이션 수(디폴트 5개))
let current_index = 0 ; //현재 보고 있는 페이지 그룹 번호
let firstPageOfCurrentIndex = 0; //현재 페이지 그룹의 첫 페이지 번호
let LastPageOfCurrentIndex = 0; //현재 페이지 그룹의 마지막 페이지 번호


menus.forEach((menu) => menu.addEventListener("click", (event) => getBooksBySubject(event)));

let searchButton = document.getElementById("search-button");

const getBooks = async () => {
    try{
      
        url.searchParams.set("startIndex", current_index); // 원하는 페이지의 index 값을 파라메터로 넣는다. &startIndex=
        let response = await fetch(url);
        let data = await response.json();
        console.log(data);
        total_hits = data.totalItems; //검색 된 총 페이지 수

        if(response.status == 200){
            //검색 된 결과가 없을 경우 결과 없음을 출력
            if(total_hits == 0){
                throw new Error("검색 된 결과값이 없습니다!!!");
            }else{
                books = data.items;
                console.log("data는: ", books);
                render();
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
        console.log("잡힌 에러 : ", error.message);
        errorRender(error.message);
    }
    
}


const getBookLists = async () => {
    url = new URL(`https://www.googleapis.com/books/v1/volumes?q=subject:business&filter=full`);
    getBooks();
}

const getBooksBySubject = async (event) => {
    //클릭한 Subject 정보를 가지고 옴
    let subject = event.target.textContent.toLowerCase();

    url = new URL(`https://www.googleapis.com/books/v1/volumes?q=subject:${subject}&filter=full`);
    getBooks();
}


const getBooksByKeyword = async () => {
    //검색한 Keyword를 가지고 옴
    let keyword = document.getElementById("input-text").value;

    url = new URL(`https://www.googleapis.com/books/v1/volumes?q=${keyword}&filter=full`);
    getBooks();
}


const render = () => {
    //let booksHTML = ``;
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


    if(total_hits < 11){ //전체 검색된 건이 11건이 안될 경우, 즉 전체 건이 한페이지에 다 나올 경우
        firstPageOfCurrentIndex = 1;
        LastPageOfCurrentIndex = 1;
        current_index = 0; //인덱스는 0부터 시작하므로
    } else{
        total_pages = Math.ceil(total_hits/10); //총 보여줄 화면의 페이지가 몇개 인지 알아내기 (ex. 총 11건이면 보여줄 화면의 수는 2페이지)
        //total_pages 가 전체 페이지의 Index 수가 됨. 이후 페이징 되는 페이지 번호가 인덱스 -1 로 호출 하면 됨.
        if (total_pages < 5){ //만약에 보여줄 화면의 수가 5페이지가 안되면 
            firstPageOfCurrentIndex = 1;
            LastPageOfCurrentIndex = total_pages; //전체 페이지가 5페이지가 넘지 않으므로 마지막 페이지는 전체페이지의 수가 된다.
        } else{
            total_page_groups = Math.ceil(total_pages/5); //총 보여주는 화면의 수를 페이징 숫자인 5로 나눠서 각 5페이지씩 그룹을 만든다.
            console.log("호출된 페이지 그룹은 : " , pageGroup);
            if((total_page_groups*5) > total_pages){ //마지막 페이지 그룹의 페이지 수가 5개가 되지 않는다면
                firstPageOfCurrentIndex = (((total_page_groups-1)*5) + 1) //마지막 페이지의 그룹의 첫번째 페이지 숫자는 이전페이지 그룹의 마지막 숫자 + 1
                LastPageOfCurrentIndex = total_pages; //마지막 페이지의 그룹의 마지막 페이지 숫자는 전체 페이지의 마지막 번호가 되야 함.
            } else{ //마지막 페이지 그룹이 아닌 중간 페이지 그룹인 경우
                firstPageOfCurrentIndex = (total_page_groups * 5) - 4;
                LastPageOfCurrentIndex = total_page_groups * 5;
            }
        }
    }

    if (current_index > 0){ //현재 페이지그룹(페이지인덱스)가 첫번째(index 0)가 아니면
        paginationHTML = ` <li class="page-item">
        <a class="page-link" href="#" aria-label="Previous" onclick="moveToPage(1)">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>`;
      
        // 내가 그룹1 일때 << < 이 없어야 한다.
      // 마지막 그룹일떄 >> > 이 없어야 한다.
  
        paginationHTML += ` <li class="page-item">
        <a class="page-link" href="#" aria-label="Previous" onclick="moveToPage(${page-1})">
          <span aria-hidden="true">&lt;</span>
        </a>
      </li>`;
    }

    for (let i = firstPageOfCurrentIndex; i <= LastPageOfCurrentIndex; i++ ){
        paginationHTML += `<li class="page-item"><a class="page-link ${(current_index+1)==i?"active":""}" href="#">${i}</a></li>`
    }

    if (current_index < (total_page_groups-1)){  //현재 페이지가 마지막 페이지 그룹이 아닐경우

        paginationHTML += `<li class="page-item">
        <a class="page-link" href="#" aria-label="Next" onclick="moveToPage(${page+1})">
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
    console.log("moveToPage 호출 됨 + page 값은 :", pageNum);
    startIndex = pageNum-1; //이동하고자 하는 페이지를 startIndex(Index 이므로 페이지에 -1을 한다)파라메터로 변환해서 넘긴다
    getBooks();

}


searchButton.addEventListener("click", getBooksByKeyword);
getBookLists();