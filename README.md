# jQuery.AudioPlayer.js

## 安装使用

- 引入jQuery
- 引进jQuery.AudioPlayer.js
- 引入theme.default.css

```
<!-- Staticfile CDN -->
<script type="text/javascript" src="https://cdn.staticfile.org/jquery/3.1.1/jquery.min.js"></script>

<!-- jQuery.AudioPlayer.js -->
<link rel="stylesheet" href="../src/theme.default.css">
<script type="text/javascript" src="../src/jQuery.AudioPlayer.js"></script>

<script type="text/javascript">
$(function() {
    var player = $.AudioPlayer;
    player.init({
        container: '#audioWrap'
        ,source: 'http://mr3.doubanio.com/70d0968fb8312ade3f04c7e1d1d18d1f/1/fm/song/p1817677_128k.mp4'
        ,imagePath: './image'
        ,debuggers: false
        ,allowSeek: true
    });
});
</script>
```


### 一些方法

- `AudioPlayer.init();` 初始化
- `AudioPlayer.updateSource();` 更新播放音频文件
- `AudioPlayer.toggleplay();` 切换暂停开始
- `AudioPlayer.play();` 开始播放
- `AudioPlayer.pause();` 暂停播放
- `AudioPlayer.muted();` 静音

#### 初始化 AudioPlayer.init();

参数 | 值 | 说明
:---:|:---:|:---
**container** | *String* | 把组件塞到哪里
**source** | *String* | 描述
**imagePath** | *String* | js用到的图片文件路径
**debuggers** | *Boolean* | 是否开启日志记录（console.info），默认关闭：`false`
**allowSeek** | *Boolean* | 是否支持拖拽，默认开启：`true`
**canplayCallback** | *function(data){}* | 可以播放之后，回调函数
**playCallback** | *function(data){}* | 播放之后，回调函数
**pauseCallback** | *function(data){}* | 暂停之后，回调函数
**seekedCallback** | *function(data){}* | 拖动之后，回调函数（`allowSeek`关闭之后记得修改提示语言）
**endedCallback** | *function(data){}* | 播放结束之后，回调函数
**mutedCallback** | *function(data){}* | 静音之后，回调函数

PS：`function(data){}` data.status == true 成功

示例：

```
AudioPlayer.init({
    container: '#audioWrap'
    ,source: './Fade.mp3'
    ,debuggers: false
    ,allowSeek: false
    ,canplayCallback: function(){
        // 可以播放回调函数
    }
    ,playCallback: function(){
        // 播放回调函数
    }
    ,pauseCallback: function(){
        // 暂停回调函数
    }
    ,seekedCallback: function(){
        // 拖动回调函数
    }
    ,endedCallback: function(){
        // 播放结束回调函数
    }
    ,mutedCallback: function(data){
        // 静音回调函数
    }
});
```


#### `AudioPlayer.updateSource();` 更新播放音频文件

参数：

- `source`：语音文件路径

例子：

```
jQuery.AudioPlayer.updateSource({
    source: './example.mp3'
});
```

#### `AudioPlayer.toggleplay();` 切换暂停开始

#### `AudioPlayer.play();` 开始播放

参数：

- function(data){}
    - data.status:true 播放成功

```
AudioPlayer.play(function(data){
    if(data.status){
        alert('Say Hello');
    }
});
```

#### `AudioPlayer.pause();` 暂停播放

参数：

- function(data){}
    - data.status:true 暂停成功

```
AudioPlayer.play(function(data){
    if(data.status){
        alert('Say Bye');
    }
});
```

#### `AudioPlayer.muted();` 切换静音

参数：

- function(data){}
    - data.status:true 静音成功

```
AudioPlayer.play(function(data){
    if(data.status){
        alert('已静音');
    }
});
```


或许你使用了，或许有一点bug，请提出宝贵的[issues](https://github.com/Keystion/jQuery.AudioPlayer.js/issues)，谢谢