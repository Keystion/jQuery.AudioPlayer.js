# jQuery.AudioPlayer.js

A audio player of jQuery plugin.

[Keystion.github.io/jQuery.AudioPlayer.js/](https://keystion.github.io/jQuery.AudioPlayer.js/)

Demo：[Keystion.github.io/jQuery.AudioPlayer.js/test/index.html](https://Keystion.github.io/jQuery.AudioPlayer.js/test/index.html)

---

#### How to use

| Path| Description |
| :-------- | :--------|
| `jQuery.AudioPlayer.js` | the script file |
| `jQuery.AudioPlayer.css`| the stylesheet file |

Example:

```
<!-- jQuery file -->
<script type="text/javascript" src="https://cdn.staticfile.org/jquery/3.1.1/jquery.min.js"></script>

<!-- jQuery.AudioPlayer.js -->
<link href="../src/theme.default.css" rel="stylesheet">
<script src="../src/jQuery.AudioPlayer.js" type="text/javascript" ></script>

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

#### Arguments：

| argument | value | Description |
| :--- | :--- | :--- |
| **container** | *String* | The outer Dom ClassName/id, default 'body'/外部Dom ClassName / id，默认的“body” |
| **source** | *String* | audio source / 音频源 |
| **imagePath** | *String* | image resources / 图像资源 |
| **debuggers** | *Boolean* |open console log, default close 'false' / 打开控制台日志,默认关闭：`false` |
| **allowSeek** | *Boolean* | Whether to support drag and drop, the default open: `true` / 是否支持拖拽，默认开启：`true` |
| **canplayCallback** | *function* | After can play TODO / 可以播放之后，做某些事情 |
| **playCallback** | *function* | After playback TODO / 播放之后，做某些事情 |
| **pauseCallback** | *function* | After the suspension TODO / 暂停之后，做某些事情 |
| **seekedCallback** | *function* | After the drag, the callback function (`allowSeek: false`) / 拖动之后，回调函数（`allowSeek: false`） |
| **endedCallback** | *function* | End of the play TODO / 播放结束之后，做某些事情 |
| **mutedCallback** | *function* | After the mute TODO / 静音之后，做某些事情 |

The 'function' result `data.status == true` mean success.

### function

- `AudioPlayer.init();` initialization / 初始化
- `AudioPlayer.updateSource();` Update the playback of audio file / 更新播放音频文件
- `AudioPlayer.toggleplay();` Switch to suspend began / 切换暂停开始
- `AudioPlayer.play();` Start playing / 开始播放
- `AudioPlayer.pause();` pause / 暂停播放
- `AudioPlayer.muted();` mute / 静音

#### AudioPlayer.init(); // initialization

Example:
```
AudioPlayer.init({
    container: '#audioWrap'
    ,source: './Fade.mp3'
    ,debuggers: false
    ,allowSeek: false
    ,canplayCallback: function(){
        // your code
    }
    ,playCallback: function(){
        // your code
    }
    ,pauseCallback: function(){
        // your code
    }
    ,seekedCallback: function(){
        // your code
    }
    ,endedCallback: function(){
        // your code
    }
    ,mutedCallback: function(data){
        // your code
    }
});
```


#### `AudioPlayer.updateSource();` 

Update the playback of audio file / 更新播放音频文件

argument / 参数:
- `source`: audio file path / 音频文件路径

Example:

```
jQuery.AudioPlayer.updateSource({
    source: './example.mp3'
});
```

#### `AudioPlayer.toggleplay();` // Switch to suspend began / 切换暂停开始

#### `AudioPlayer.play();` // Start playing / 开始播放

argument / 参数:

- function(data){}
    - data.status:true 播放成功

Example:
```
AudioPlayer.play(function(data){
    if(data.status){
        alert('Say Hello');
    }
});
```

#### `AudioPlayer.pause();` 暂停播放

argument / 参数:

- function(data){}
    - data.status:true 暂停成功

Example:
```
AudioPlayer.play(function(data){
    if(data.status){
        alert('Say Bye');
    }
});
```

#### `AudioPlayer.muted();` 切换静音

argument / 参数:

- function(data){}
    - data.status:true 静音成功

Example:
```
AudioPlayer.play(function(data){
    if(data.status){
        alert('已静音');
    }
});
```

#### Change log

##### 2017.01.06

- Add comments in English
- Fix the window change audio download progress bar UI has not changed


#### [issues](https://github.com/Keystion/jQuery.AudioPlayer.js/issues)

Create a new [issues](https://github.com/Keystion/jQuery.AudioPlayer.js/issues)
