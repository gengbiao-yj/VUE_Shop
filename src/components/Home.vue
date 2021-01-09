<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <!-- 头像 -->
        <img
          src="../assets/images/4ba5a9660b1231ecbdbe1b310c8b10b.jpg"
          alt=""
          class="header_img"
        />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="quit">退出</el-button>
    </el-header>
    <!-- 页面主题区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle_button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="savedPath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menulist"
            :key="item.id"
          >
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="`/${subitem.path}`"
              v-for="subitem in item.children"
              :key="subitem.id"
              @click="saveNavState(`/${subitem.path}`)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subitem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主题 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
    <el-footer>
      <!-- 音频播放 -->
      <audio ref="audio" @timeupdate="onTimeUpdate" @ended="musicEnded">
        <source :src="musicUrl" />
      </audio>
      <!-- 上一首 -->
      <i @click="musicChange(-1)" class="iconfont icon-shangyishou"></i>
      <!-- 播放暂停 -->
      <i
        @click="musicStop"
        :class="
          this.playState ? 'iconfont icon-zanting' : 'iconfont icon-bofang'
        "
      ></i>
      <!-- 下一首 -->
      <i @click="musicChange(1)" class="iconfont icon-xiayishou"></i>
      <!-- 音量 -->
      <i @click="volumeValueDisplay">
        <i
          :class="
            this.volumeValue ? 'iconfont icon-laba' : 'iconfont icon-jingyin'
          "
        ></i>
      </i>
      <!-- 音量调节滑块  -->
      <el-slider
        :class="slidVolume"
        id="sliderVolume"
        @input="changeMusicvolume"
        v-model="volumeValue"
        vertical
        height="80px"
        :format-tooltip="formatTooltip"
      >
      </el-slider>
      <!-- 播放进度条 -->
      <el-slider
        id="musicTimeBox"
        v-model="musicDuration"
        :show-tooltip="false"
        @change="changeMusicCurrentTime"
      ></el-slider>
      <span class="displayTime">
        {{ displayTime }}
      </span>
    </el-footer>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menulist: [],
      iconObj: {
        125: "iconfont icon-user",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao",
      },
      isCollapse: false,
      savedPath: "",
      musicSrc: [
        // "AC／DC - Got Some Rock & Roll Thunder.mp3",
        // "You Don't Know Me.mp3",
        // "Diddy,Faith Evans - I'll Be Missing You.mp3",
        // "Macklemore,Ryan Lewis - Thrift Shop (feat. Wanz).mp3",
        // "Rake - 夢を抱いて～はじまりのクリスロード～.mp3",
        // "戴荃 - 悟空.mp3",
        // "谭咏麟 - 讲不出再见.mp3",
        // "逃跑计划 - 再见,再见.mp3",
        // "黑豹乐队 - 脸谱.mp3"
        "http://m10.music.126.net/20210105192134/751521e071ca92fa3f7a8bc780cddfec/ymusic/c0a1/2a47/3285/57e7832addb5920f6f5c8c269808b3ca.mp3",
        "http://m10.music.126.net/20210106111808/2e15b7271912760a02f94bf46865cb25/ymusic/obj/w5zCgMODwrDDjD3DisKy/604481600/b140/b786/f4d6/6eac342203142e918f0cae926e3602e0.mp3",
        "https://sharefs.yun.kugou.com/202101061056/09ae4c6537812a45e9d73fc59cf6283f/G031/M03/19/09/Xw0DAFWkJliARLqyADtpWTa53PA526.mp3",
        "http://m10.music.126.net/20210105194031/d1f71f3b5a7b0d7fe6b7dc9789c4fde7/ymusic/6da4/abf4/3c63/21159b4b270c05c4771a78a8dd4dbd97.mp3",
        "http://m10.music.126.net/20210105194121/3b36456d92c100e488c621085d09e72a/ymusic/4e04/cf43/9109/7f6abe75b44a051dd77107657daab9ce.mp3",
        "http://m10.music.126.net/20210105194153/3f65ca7dab93890da65272600ec539e0/ymusic/54ea/91ec/767e/20497bcc9ffc83e89184a6999258ae72.mp3",
        "http://m10.music.126.net/20210105194233/f2ba0951042ade7ad7c8d1c4d1dd65b4/ymusic/obj/w5zDlMODwrDDiGjCn8Ky/3058350452/0e87/788b/00e2/e3425aceafc1d55b107867d40356ddcc.mp3",
        "http://m10.music.126.net/20210105194258/34574c2aae3ce210ac104dff6b6977bf/ymusic/7ea6/95d9/c132/e54b02ad15faa4181e838b692acceb17.mp3",
        "http://m10.music.126.net/20210105194345/fd2b85ae742e9ca5d1cad5522a38d311/ymusic/obj/w5zDlMODwrDDiGjCn8Ky/3066916116/b95d/ee10/9cc6/2a8e943337760d8a11cb9d53aa75e8dd.mp3",
      ],
      // musicUrl: require("../assets/music/AC／DC - Got Some Rock & Roll Thunder.mp3"), // 动态引入音频地址
      musicUrl: "http://m10.music.126.net/20210105192134/751521e071ca92fa3f7a8bc780cddfec/ymusic/c0a1/2a47/3285/57e7832addb5920f6f5c8c269808b3ca.mp3",
      musicSrcId: 0, // 音频切换标志
      playState: false, // 音乐播放暂停标志
      volumeValue: 50, // 音量
      musicDuration: 0, // 音乐时长位置
      displayTime: "00:00/00:00",
      // 音量显示、隐藏样式绑定
      slidVolume:{
        volumeValueDisplay:false
      }
    };
  },
  created() {
    this.getMenuList();
    //                                     获取值是 get！！！
    this.savedPath = window.sessionStorage.getItem("activePath");
  },
  methods: {
    // 获取左侧菜单
    async getMenuList() {
      const { data: res } = await this.axios.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
    },
    // 退出操作
    quit() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    // 侧边栏折叠
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    // 保存链接的状态
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      this.savedPath = activePath;
    },
    // 切换音乐
    musicChange(change) {
      this.musicSrcId += change;
      if (this.musicSrcId == -1) this.musicSrcId = this.musicSrc.length - 1;
      if (this.musicSrcId == this.musicSrc.length) this.musicSrcId = 0;
      let src = this.musicSrc[this.musicSrcId];
      // this.musicUrl = require("../assets/music/" + src);
      this.musicUrl = src;
      this.$refs.audio.load();
      this.$refs.audio.play();
      this.playState = true;
    },
    // 播放开始暂停
    musicStop() {
      this.$refs.audio.paused
        ? this.$refs.audio.play()
        : this.$refs.audio.pause();
      this.playState = !this.playState;
    },
    // 调整音量
    changeMusicvolume() {
      let actVolumeValue = this.volumeValue / 100;
      this.$refs.audio.volume = actVolumeValue;
    },
    // 音量滑块显示值处理
    formatTooltip(val) {
      return `${val}%`;
    },
    // 音量操作盒显示
    volumeValueDisplay() {
      this.slidVolume.volumeValueDisplay = !this.slidVolume.volumeValueDisplay;
    },
    // 切换当前曲目播放位置
    changeMusicCurrentTime() {
      let actMusicDuration =
        (this.musicDuration * this.$refs.audio.duration) / 100;
      this.$refs.audio.currentTime = actMusicDuration;
    },
    // 曲目播放进度条更新
    onTimeUpdate() {
      // 进度条更新
      let actMusicDuration =
        (this.$refs.audio.currentTime * 100) / this.$refs.audio.duration;
      this.musicDuration = actMusicDuration;
      // 时间显示更新
      if (this.$refs.audio.readyState) {
        let fullMusicTimeM = parseInt(this.$refs.audio.duration / 60);
        let fullMusicTimes = parseInt(
          this.$refs.audio.duration - fullMusicTimeM * 60
        );
        let actMusicTimeM = parseInt(this.$refs.audio.currentTime / 60);
        let actMusicTimeS = parseInt(
          this.$refs.audio.currentTime - actMusicTimeM * 60
        );
        this.displayTime =
          ("0" + actMusicTimeM).slice(-2) +
          ":" +
          ("0" + actMusicTimeS).slice(-2) +
          "/" +
          ("0" + fullMusicTimeM).slice(-2) +
          ":" +
          ("0" + fullMusicTimes).slice(-2);
      }
    },
    // 当前曲目播放结束
    musicEnded() {
      this.playState = false;
      this.$refs.audio.pause();
      setTimeout(() => {
        this.musicChange(1);
      }, 200);
    },
  },
};
</script>

<style scoped lang="less">
.iconfont {
  margin-right: 8px;
}

.home_container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0px;
  align-items: center;
  color: #fff;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: 0px;
  }
}

.el-main {
  background-color: #eaedf1;
}

.header_img {
  width: 55px;
  height: 55px;
  border-radius: 50%;
}
.toggle_button {
  background-color: #4a5064;
  font-size: 10px;
  color: #fff;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
.el-footer {
  padding-top: 4px;
  background: #373d41;
  display: flex;
  align-items: center;
}

.iconfont:hover {
  cursor: pointer;
}
#sliderVolume {
  padding-top: 10px;
  position: relative;
  top: -87px;
  left: -44px;
  height: 100px;
  background-color: rgba(40, 40, 40, 0.5);
  border-radius: 5px;
}
#musicTimeBox {
  top: 10px;
  left: -10px;
  position: relative;
  width: 600px;
}
.displayTime {
  top: 10px;
  left: 5px;
  position: relative;
  color: rgb(160, 160, 160);
}
.volumeValueDisplay{
  visibility: hidden ;
}
</style>