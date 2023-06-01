/**
 * 1. Render song
 * 2. Scroll top
 * 3. Play/ pause/seek
 * 4. CD rotate
 * 5. Next / prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";
const cd = $(".cd");
const cdWidth = cd.offsetWidth;

const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");

const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $("#progress");

const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");

const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");
const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Bài này chill phết",
      singer: "Đen Vâu ft.Min",
      path: "../Images/music/bainaychillphet.mp3",
      image: "../Images/img/bainaychillphet.jpg",
    },
    {
      name: "Có ai muốn nghe không",
      singer: "Đen Vâu",
      path: "../Images/music/coaimuonnghekhong.mp3",
      image: "../Images/img/coaimuongnghekhong.jpg",
    },
    {
      name: "Em bỏ hút thuốc chưa",
      singer: "Bích phương",
      path: "../Images/music/embohutthuochua.mp3",
      image: "../Images/img/embohutthuochua.png",
    },
    {
      name: "Gửi anh xa nhớ",
      singer: "Bích phương",
      path: ".../Images/music/guianhxanho.mp3",
      image: "../Images/img/guianhxanho.jpg",
    },
    {
      name: "Mười năm",
      singer: "Đen Vâu",
      path: "../Images/music/muoinam.mp3",
      image: "../Images/img/muoinam.jpg",
    },
    {
      name: "Trốn tìm",
      singer: "Đen Vâu",
      path: "../Images/music/trontim.mp4",
      image: "../Images/img/trontim.jpg",
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map(
      (song, index) =>
        `
                       <div class="song ${
                         index === this.currentIndex ? "active" : ""
                       }" data-index='${index}'>
                           <div class="thumb"
                           style="background-image: url('${song.image}');">
                           </div>
                           <div class="body">
                               <h3 class="title">${song.name}</h3>
                               <p class="author">${song.singer}</p>
                           </div>
                           <div class="option">
                               <i class="fa-solid fa-ellipsis"></i>
                           </div> 
                       </div>
                   `
    );
    playlist.innerHTML = htmls.join("");
  },
  defindProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },
  handleEvents: function () {
    const _this = this;

    //1. Xử lý CD quay/ dừng
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, //10s
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    //Xử lý phóng to thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    //Xử lý khi click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };
    //Khi song tobe played
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };
    //Khi song tobe paused
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    //Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    //Xử lý khi  tua song
    progress.onchange = function (e) {
      const seekTime = (e.target.value / 100) * audio.duration;
      audio.currentTime = seekTime;
    };

    //Khi next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };
    //Khi previous song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    //Xử lý bật/ tắt random song
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active");
    };

    //Xử lý lặp lại 1 song
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRandom", _this.isRandom);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };
    //Xử lý next khi ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    //Lắng nghe hành vi click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode || e.target.closest(".option")) {
        //Xử lý khi click vào song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }

        //Xử lí khi click vào song option
        if (e.target.closest(".option")) {
        }
      } else {
      }
    };
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 500);
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  start: function () {
    //Gắn cấu hình từ config vào ứng dựng
    this.loadConfig();
    //Định nghĩa các thuộc tính cho object
    this.defindProperties();

    //Lắng nghe xử lí các sự kiện
    this.handleEvents();

    //Tải thông tin bài hát đầu tiên vào UI khi chạy
    this.loadCurrentSong();

    //Render playlist
    this.render();
    //hIỂN THỊ TRẠNG THÁI BAN ĐẦU CỦA BUTTON REPEAT $ RADNOM
    repeatBtn.classList.toggle("active", this.isRepeat);
    randomBtn.classList.toggle("active", this.isRandom);
  },
};
app.start();
