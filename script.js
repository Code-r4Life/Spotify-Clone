let cards = document.querySelectorAll(".card");
let previous = document.querySelector("#previous");
let play = document.querySelector("#play");
let next = document.querySelector("#next");
let song = new Audio();           // create a single audio element and update its src to play songs
let currFolder;
let songs = [];
let names = [];
let currIdx = -1;

function secondsToMMSS(seconds) {
       // Calculate minutes and remaining seconds
       let minutes = Math.floor(seconds / 60);
       let remainingSeconds = seconds % 60;

       if (remainingSeconds<10){
                remainingSeconds = parseInt("0"+String(remainingSeconds));
       }
   
       // Pad minutes and seconds with leading zeros if necessary
       const minutesPadded = String(minutes).padStart(2, '0');
       const secondsPadded = String(remainingSeconds).padStart(2, '0');
       
       if(isNaN(minutesPadded) || isNaN(secondsPadded)){
                return "00:00";
       }
       // Return the formatted string
       return `${minutesPadded}:${secondsPadded}`;
}

const getSongs = async(folder)=> {
       currFolder = folder;
       let a = await fetch(`/songs/${currFolder}/`);
       let response  = await a.text();
       let div = document.createElement("div");
       div.innerHTML = response;
       let songs = [];
       let songName = [];
       let as = div.querySelectorAll("ul li a span.name");
       for (let i=(as.length)-1 ; i>=1 ; i--) {
              songs.push(as[i].innerText);
              songName.push(as[i].innerText.replace(".mp3",""));
       }
       return([songs , songName]); 
}

const changeTxtSrc = (song) => {
       if (currIdx !== -1) {
           const previousLi = document.querySelectorAll(".songList li")[currIdx];
           if (previousLi) {
               previousLi.querySelector("div.playNow").children[0].innerText = "Play Now";
               previousLi.querySelector("div.playNow").children[1].src = "svgs/songplay.svg"; // Reset icon
           } else {
               console.warn("Previous list item not found for index:", currIdx);
           }
       }
   
       currIdx = songs.indexOf(String(song.src.split('/').pop()).replaceAll("%20", " "));
   
       const currentLi = document.querySelectorAll(".songList li")[currIdx];
       if (currentLi) {
           currentLi.querySelector("div.playNow").children[0].innerText = "Playing";
           currentLi.querySelector("div.playNow").children[1].src = "svgs/songpause.svg";
       } else {
           console.warn("Current list item not found for index:", currIdx);
       }

       if(song.paused == false){
              currentLi.querySelector("div.playNow").children[1].src = "svgs/songpause.svg";
       }
       else{
              currentLi.querySelector("div.playNow").children[1].src = "svgs/songplay.svg";
       }
}

function nextSong() {
       let currentSongSrc = String(song.src.split('/').pop()).replaceAll("%20", " ");
       let currentIndex = songs.indexOf(currentSongSrc);
   
       // Move to the next song or loop back to the start
       if (currentIndex === songs.length-1) {
           currentIndex = 0;
       } else {
           currentIndex+=1;
       }
   
       let nextSongSrc = songs[currentIndex];
       let nextSongName = names[currentIndex];
   
       playAudio(nextSongSrc, nextSongName, true);
}
   
const main = async()=> {
       cards.forEach(card => {
              card.addEventListener("click", async (e)=> {
                     currFolder = (e.currentTarget.innerText.split("\n")[0].replaceAll(" ",""));
                     let artists = (e.currentTarget.innerText.split("\n")[2]);
                     let imageURL = card.querySelectorAll("img")[1].src;
                     [songs , names] = await getSongs(`${currFolder}`);
                     playAudio(songs[0],names[0],true);
                     let songUL = document.querySelector(".songList ul");
                     songUL.innerHTML = "";
                     play.src="svgs/songpause.svg";
                     document.querySelector(".circle").style.left = "-0.4%";
                     for (let i=0; i<=(names.length)-1; i++) {
                            songUL.innerHTML += `<li><img style="filter: invert(0); border: none; border-radius: 7px" src=${imageURL} height="45" alt="">
                            <div class="info">
                                             <div>${names[i]}</div>
                                             <div>${artists}</div>
                            </div>
                                   <div class="playNow">
                                   <span>Play Now</span>
                                   <img src="svgs/songplay.svg" height="24" alt="">
                            </div></li>`;
                     }
                     let arr = document.querySelectorAll(".songList li");
                     arr.forEach(e=> {
                            e.addEventListener("click", ()=> {
                                   let arr2 = e.innerText.split("\n");
                                   let song = songs[names.indexOf(arr2[0])];
                                   playAudio(song,names[songs.indexOf(song)],true);
                                   changeTxtSrc(song);
                            })
                     })
              })
       })

       // Attaching event listeners with play
       play.addEventListener("click", ()=> {
               if(song.paused){
                     song.play();
                     play.src = "svgs/songpause.svg";
               }
               else{
                     song.pause();
                     play.src = "svgs/songplay.svg";
               }
               changeTxtSrc(song);
       })
       
       // Attaching event listenser with previous
       previous.addEventListener("click", ()=> {
              let currentSongSrc = String(song.src.split('/').pop()).replaceAll("%20", " ");
              let currentSong1 = songs[songs.indexOf(currentSongSrc)];
              let currentName1 = names[songs.indexOf(currentSongSrc)];
              if(songs.indexOf(currentSongSrc) == 0){
                     currentSong1 = songs[songs.length-1];
                     currentName1 = names[names.length-1];
                     playAudio(currentSong1,currentName1,true);
              }
              else{
                     currentSong1 = songs[songs.indexOf(currentSongSrc)-1];
                     currentName1 = names[songs.indexOf(currentSongSrc)-1];
                     playAudio(currentSong1,currentName1,true);
              }
       })
       
       // Attaching event listenser with next
       next.addEventListener("click", ()=> {
              let currentSongSrc = String(song.src.split('/').pop()).replaceAll("%20", " ");
              let currentSong2 = songs[songs.indexOf(currentSongSrc)];
              let currentName2 = names[songs.indexOf(currentSongSrc)];
              if(songs.indexOf(currentSongSrc) == songs.length-1){
                     currentSong2 = songs[0];
                     currentName2 = names[0];
                     playAudio(currentSong2,currentName2,true);
              }
              else{
                     currentSong2 = songs[songs.indexOf(currentSongSrc)+1];
                     currentName2 = names[songs.indexOf(currentSongSrc)+1];
                     playAudio(currentSong2,currentName2,true);
              }
       })
       
       // Attaching event listener with volume bar
       document.querySelector(".range").addEventListener("change", (e)=> {
              song.volume = (e.target.value)/100;
              if(song.volume == 0){
                     document.querySelector(".songVol img").src = "svgs/mute.svg";
              }
              else{
                     document.querySelector(".songVol img").src = "svgs/volume.svg";
              }
       })

       document.querySelector(".songVol img").addEventListener("click", (e)=> {
              if(e.target.src.includes("svgs/volume.svg")){
                     e.target.src = "svgs/mute.svg";
                     song.volume = 0;
                     document.querySelector(".range input").value = 0;
              }
              else{
                     e.target.src = "svgs/volume.svg";
                     song.volume = 0.1;
                     document.querySelector(".range input").value = 10;
              }
       });

}

const playAudio = (track,trackName,pause)=> {
       song.src = `songs/${currFolder}/` + track;
       if(pause){
              song.play();
              play.src = "svgs/songpause.svg";         // if song is playing, change svg to songpause
              setTimeout(() => changeTxtSrc(song), 100);   // as songs are getting loaded asynchronously, so dealying the function call is important
       }

       document.querySelector(".songinfo").innerText = trackName;
       document.querySelector(".songtime").innerHTML = "00:00/00:00";

       // listening for timeupdates in playing song
       song.addEventListener("timeupdate", ()=> {
              document.querySelector(".songcontents .songtime").innerText = `${(secondsToMMSS(song.currentTime)).split(".")[0]}/${(secondsToMMSS(song.duration)).split(".")[0]}`;

              // to translate the circle of the seekbar
              document.querySelector(".circle").style.left = (song.currentTime / song.duration)*100 + "%";   
       })

       song.addEventListener("ended", nextSong);

       document.querySelector(".seekbar").addEventListener("click", (e)=> {
              
              // e.offsetX gives the x-coordinate relative to the target node
              // e.target.getBoundingClientRect().width gives the width of the target node as a rectangle
               document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width)*100 + "%";
               song.currentTime = song.duration * (e.offsetX / e.target.getBoundingClientRect().width);
       })

       document.querySelector(".hamburger").addEventListener("click", ()=> {
                document.querySelector(".left").style.left = "0%";
                document.querySelector(".left").style.width = "374px";
                document.querySelector(".box1").style.width = "98%";
                document.querySelector(".box2").style.width = "98%";
       })

       document.querySelector(".close").addEventListener("click", ()=> {
                document.querySelector(".left").style.left = "-100%";
       })
}

main();
