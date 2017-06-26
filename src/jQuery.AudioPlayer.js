/**
 * jQuery.AudioPlayer.js
 * @Author Keystion
 * @Version 1.0.1
 * Created by Keystion on 2016-12-19. Update on 2017-01-06
 * https://github.com/Keystion/jQuery.AudioPlayer.js
 */
;(function(jQuery){
    "use strict";
    var AudioPlayer = {
        options: {
            // open console log / 打开控制台日志
            debuggers: false
            // The outer Dom ClassName/id, default 'body'
            // 外部Dom ClassName / id，默认的“body”
            ,container: 'body'
            // audio source / 音频源
            ,source: ''
            // image resources / 图像资源
            ,imagePath: './image'
            // Determines whether or not the player is playing before dragging/判断拖拽之前是否正在播放
            ,seekNum: 0
            // Whether to support drag and drop, the default open: `true` / 是否支持拖拽，默认开启：`true`
            ,allowSeek: true
            // After can play TODO / 可以播放之后，做某些事情
            ,canplayCallback: null
            // After searching for the audio TODO / 开始查找音频源之后，做某些事情
            ,onloadstartCallback: null
            // 需要缓冲下一帧而停止，做某些事情
            ,onwaitingCallback: null
            // After playback TODO / 播放之后，做某些事情
            ,playCallback: null
            // After the suspension TODO / 暂停之后，做某些事情
            ,pauseCallback: null
            // After the drag TODO / 拖动之后，做某些事情
            ,timeupdateCallback: null
            // After the drag, the callback function (`allowSeek: false`) / 拖动之后，回调函数（`allowSeek: false`）
            ,seekedCallback: null
            // End of the play TODO / 播放结束之后，做某些事情
            ,endedCallback: null
            // After the mute TODO / 静音之后，做某些事情
            ,mutedCallback: null
            // template dom / 模板节点
            ,template: $('<div id="componentWrapper">' +
                '<audio id="audio-element" style="display: none;">您的浏览器不支持 audio 标签。</audio>' +
                '<div class="controls_toggle"><img src="" alt="controls_toggle" /></div>' +
                '<div class="player_mediaTime_current">00:00</div>' +
                '<div class="player_progress">' +
                '<div class="progress_bg"></div>' +
                '<div class="load_progress"></div>' +
                '<div class="play_progress"></div>' +
                '<div class="player_progress_tooltip">' +
                '<p></p>' +
                '</div>' +
                '</div>' +
                '<div class="player_mediaTime_total">00:00</div>' +
                '<div class="player_volume_wrapper">' +
                '<div class="player_volume"><img src="" alt="player_volume" /></div>' +
                '<div class="volume_seekbar">' +
                '<div class="volume_bg"></div>' +
                '<div class="volume_level"></div>' +
                '<div class="player_volume_tooltip">' +
                '<p></p>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>')
        }
        // elements
        ,elements: {}
        // initialize
        ,init: function(options) {
            var _this = this;
            if (!options || !options.container) {
                return false;
            }
            this.options = $.extend(this.options, options);

            // audio DOM
            _this.elements.audioDom = _this.options.template.find('audio')[0];
            _this.elements.componentWrapper = _this.options.template.find('#componentWrapper');
            // Play button / 播放按钮
            _this.elements.playButton = _this.options.template.find('.controls_toggle');
            // The current time / 当前时间
            _this.elements.currentTime = _this.options.template.find('.player_mediaTime_current');
            // The total length / 总时长
            _this.elements.totalTime = _this.options.template.find('.player_mediaTime_total');
            // Loading progress bar / 加载进度条
            _this.elements.loadProgress = _this.options.template.find('.load_progress');
            // Playback progress bar / 播放进度条
            _this.elements.playProgress = _this.options.template.find('.play_progress');
            // Playback progress bar wrap / 播放进度条wrap
            _this.elements.playProgressWrap = _this.options.template.find('.player_progress');
            // The total length of playback progress bar / 播放进度条总长
            _this.elements.totalPlayProgress = _this.options.template.find('.progress_bg');
            // Mute button / 静音按钮
            _this.elements.mutedButton = _this.options.template.find('.player_volume');
            // The volume size wrap / 音量大小wrap
            _this.elements.volumeWrap = _this.options.template.find('.volume_seekbar');
            // The volume chief / 音量总长
            _this.elements.totalVolume = _this.options.template.find('.volume_bg');
            // The current volume / 当前音量
            _this.elements.currentVolume = _this.options.template.find('.volume_level');
            // The tooltips of the volume / 音量提示条
            _this.elements.tipsVolume = _this.options.template.find('.player_volume_tooltip');
            $(_this.options.container).append(_this.options.template);

            _this.elements.playButton.find('img').attr('src', _this.options.imagePath + '/play.png');
            _this.elements.mutedButton.find('img').attr('src', _this.options.imagePath + '/volume.png');

            if(options.source){
                _this.updateSource({source: options.source, callback: function(){ _this.log('The audio source has been updated') }});
            }

            _this.elements.currentVolume.width((60 / 100 * _this.elements.audioDom.volume * 100) + 'px');

            // Initialize the event / 初始化事件
            _this.events();
        }
        // Update the audio source foo. / 更新音频源
        ,updateSource: function(o){
            var _this = this;
            // reset
            _this.reset();

            // Update the audio source / 更新音频源
            _this.elements.audioDom.setAttribute('src', o.source);

            // callback
            if(typeof o.callback == 'function'){
                o.callback();
            }
        }
        // dom events
        ,events: function() {
            var _this = this;

            // Monitor window changes to do some of the UI update / 监听窗口的变化做一些UI的更新
            $(window).resize(function(event) {

                // Update the width of the download progress bar / 更新下载进度条的宽度
                _this.setLoadProgressWidth();
                // Update the playback progress bar width / 更新播放进度条的宽度
                _this.elements.playProgress.width((_this.elements.audioDom.currentTime / _this.elements.audioDom.duration) * $('.progress_bg').width());
            });

            // Adjust the size of sound / 调节声音大小
            _this.elements.volumeWrap.on("mouseenter", function(event) {
                event.preventDefault();
            }).on("mouseleave", function(event) {
                event.preventDefault();
                _this.elements.tipsVolume.css('display', 'none');
                _this.setvolume();
            }).on('mousemove', function(event) {
                event.preventDefault();
                if ((event.pageX - _this.elements.totalVolume.offset().left) > 0 && (event.pageX - _this.elements.totalVolume.offset().left) < (_this.elements.totalVolume.width() + 1)) {
                    _this.elements.tipsVolume.css({
                        'display': 'block',
                        "left": parseInt(event.pageX - _this.elements.totalVolume.offset().left + _this.elements.totalVolume.width() / 2 - 40, 10) + "px"
                    });
                    _this.elements.tipsVolume.find("p").html(_this.sumVolume(event) + " %");
                    _this.elements.currentVolume.width(event.pageX - _this.elements.totalVolume.offset().left + "px");
                }
            }).on('mouseup', function(event) {
                event.preventDefault();
                _this.elements.currentVolume.width(event.pageX - _this.elements.totalVolume.offset().left + "px");

                _this.setvolume({
                    event: event
                });
            });

            _this.elements.mutedButton.on('click', function(event) {
                event.preventDefault();
                /* Act on the event */
                _this.muted();
            });

            // Playback progress bar drag and drop events / 播放进度条拖拽事件
            // To determine whether to allow drag and drop / 判断是否允许拖拽
            if(_this.options.allowSeek){
                _this.elements.playProgressWrap.on('mousedown', function(event) {
                    event.preventDefault();
                    if (_this.elements.audioDom.paused) {
                        _this.options.seekNum = 1;
                    } else {
                        _this.options.seekNum = 2;
                        _this.pause();
                    }
                    // The mouse click will update the progress bar / 鼠标按下就更新进度条
                    _this.setPlayProgressWidth(event);
                }).on('mousemove', function(event) {
                    event.preventDefault();
                    // Determine whether have begun to move will set the progress bar / 判断是否已经开始移动 才会设置进度条
                    _this.options.seekNum != 0 && _this.setPlayProgressWidth(event);
                }).on('mouseup', function(event) {
                    event.preventDefault();
                    // TODO 
                    // Is it necessary to when the mouse button to lift again to update the playback progress bar width
                    // 是否有必要在鼠标按键抬起的时候再次去更新播放进度条宽度
                    // _this.setPlayProgressWidth(event);
                    if (_this.options.seekNum == 1) {
                        _this.pause();
                    } else {
                        _this.play();
                    }
                    _this.options.seekNum = 0;
                    if(typeof _this.options.seekedCallback == 'function'){
                        _this.options.seekedCallback({'status': _this.elements.audioDom.seeked});
                    }
                })
            }else{
                _this.elements.playProgressWrap.on('mousedown', function(event) {
                    event.preventDefault();
                    if(typeof _this.options.seekedCallback == 'function'){
                        _this.options.seekedCallback();
                    }else{
                        alert('暂时不支持拖拽');
                        return false;
                    }
                })
            }

            // Click event broadcast suspended / 播放暂停点击事件
            _this.elements.playButton.on('click', function(event) {
                event.preventDefault();
                _this.toggleplay({
                    playCallback: function(){ _this.log('toggleplay：play') },
                    pauseCallback: function(){ _this.log('toggleplay：pause') }
                });
            })

            // When audio load has abandoned / 当音频的加载已放弃时
            _this.elements.audioDom.onabort = function() {
                _this.log('onabort');

                _this.reset();
            }

            // When the browser can play audio / 当浏览器可以播放音频时
            _this.elements.audioDom.oncanplay = function() {
                _this.log('oncanplay');
                // Determine the audio to load / 判断音频加载完毕
                if (_this.elements.audioDom.readyState == 4) {
                    var duration = Math.round(_this.elements.audioDom.duration);
                    var minutes = Math.floor(duration / 60);
                    minutes = 10 <= minutes ? minutes : "0" + minutes;
                    duration = Math.floor(duration % 60);

                    _this.elements.totalTime.html(minutes + ":" + (10 <= duration ? duration : "0" + duration));

                    if(typeof _this.options.canplayCallback == 'function'){
                        _this.options.canplayCallback({'status': true});
                    }
                }
            }

            // When the browser is downloading audio / 当浏览器正在下载音频时
            _this.elements.audioDom.onprogress = function() {
                if (_this.elements.audioDom.readyState == 4) {
                    _this.elements.loadProgress.width((_this.elements.audioDom.buffered.end(0) / _this.elements.audioDom.seekable.end(0)) * _this.elements.totalPlayProgress.width());
                }
            };

            // When the browser begins searching for the audio / 当浏览器开始查找音频时
            _this.elements.audioDom.onloadstart = function() {
                _this.log('onloadstart');
                if(typeof _this.options.onloadstartCallback == 'function'){
                    _this.options.onloadstartCallback({'status': true});
                }
            }

            // When the audio has begun or is no longer suspended / 当音频已开始或不再暂停时
            _this.elements.audioDom.onplay = function() {
                _this.log('onplay');
                _this.elements.playButton.find('img').attr('src', _this.options.imagePath + '/pause.png');
            }

            // When the audio has been suspended / 当音频已暂停时
            _this.elements.audioDom.onpause = function() {
                _this.log('onpause');
                _this.elements.playButton.find('img').attr('src', _this.options.imagePath + '/play.png');
            }

            // When the current playlist has ended / 当目前的播放列表已结束时
            _this.elements.audioDom.onended = function() {
                _this.log('onended');

                if(typeof _this.options.endedCallback == 'function'){
                    _this.options.endedCallback({'status': _this.elements.audioDom.ended});
                }
            }

            // When the user starts moving/jump to the new location in the audio
            // 当用户开始移动/跳跃到音频中的新位置时
            _this.elements.audioDom.onseeking = function() {
                _this.log('onseeking');
            }

            // When the user has mobile/jump to the new location in the audio
            // 当用户已移动/跳跃到音频中的新位置时
            _this.elements.audioDom.onseeked = function() {
                _this.log('onseeked');
            }

            // When the current playback position has changed
            // 当目前的播放位置已更改时
            _this.elements.audioDom.ontimeupdate = function() {
                _this.log('ontimeupdate');
                _this.timeupdate();
            }

            _this.elements.audioDom.onwaiting = function() {
                _this.log('onwaiting');
                if(typeof _this.options.onwaitingCallback == 'function'){
                    _this.options.onwaitingCallback({'status': true});
                }
            }

            // When the volume is changed
            // 当音量已更改时
            _this.elements.audioDom.onvolumechange = function() {
                _this.log('onvolumechange');
                _this.setvolume();
            }
        }
        // Toggle play/pause 切换播放/暂停
        ,toggleplay: function(o) {
            var _this = this;
            if (_this.elements.audioDom.paused) {
                _this.play(o.playCallback);
            } else {
                _this.pause(o.pauseCallback);
            }
        }
        // Set the playback / 设置播放
        ,play: function(o) {
            var _this = this;
            _this.elements.audioDom.play();
            if (typeof o == 'function') {
                o({'status': _this.elements.audioDom.play});
            }

            if(typeof _this.options.playCallback == 'function'){
                _this.options.playCallback({'status': _this.elements.audioDom.play});
            }
        }
        // Set the suspend / 设置暂停
        ,pause: function(o) {
            var _this = this;
            _this.elements.audioDom.pause();
            if (typeof o == 'function') {
                o({'status': _this.elements.audioDom.play});
            }

            if(typeof _this.options.pauseCallback == 'function'){
                _this.options.pauseCallback({'status': _this.elements.audioDom.play});
            }
        }
        // muted / 设置静音否
        ,muted: function(o) {
            var _this = this;
            if (_this.elements.audioDom.muted) {
                _this.elements.audioDom.muted = false;
                _this.elements.mutedButton.find('img').attr('src', _this.options.imagePath + '/volume.png');
            } else {
                _this.elements.audioDom.muted = true;
                _this.elements.mutedButton.find('img').attr('src', _this.options.imagePath + '/mute.png');
            }

            if(typeof _this.options.mutedCallback == 'function'){
                _this.options.mutedCallback({'status': _this.elements.audioDom.muted});
            }
        }
        // Set the sound size / 设置声音大小
        ,setvolume: function(options) {
            var _this = this;
            if (!options) {
                _this.elements.currentVolume.width((_this.elements.totalVolume.width() / 100 * _this.elements.audioDom.volume * 100) + 'px');
            } else {
                if (options.event) {
                    return _this.elements.audioDom.volume = _this.sumVolume(options.event) / 100;
                } else {
                    // TODO _this.log 
                    // Need to optimize / 需要优化
                    _this.options.debuggers && console.error('缺少参数：options.event');
                    return false;
                }
            }
        }
        // Set the playback progress bar / 设置播放进度条
        ,setPlayProgressWidth: function(argument) {
            var _this = this;
            if (!argument) {
                return false;
            }

            // if ((argument.clientX - _this.elements.playProgressWrap.offset().left) > _this.elements.loadProgress.width()) {
            //     _this.elements.playProgress.width(argument.clientX - _this.elements.playProgressWrap.offset().left);
            // } else {
                _this.elements.playProgress.width(argument.clientX - _this.elements.playProgressWrap.offset().left);
                _this.elements.audioDom.currentTime = (argument.clientX - _this.elements.playProgressWrap.offset().left) / _this.elements.totalPlayProgress.width() * _this.elements.audioDom.duration;
            // }
        }
        // Set the width of the download progress bar / 设置下载进度条的宽度
        ,setLoadProgressWidth: function(){
            var _this = this;

            // The audio of the ready state / 音频的就绪状态
            // More docs: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
            // TODO Add other state
            if (_this.elements.audioDom.readyState == 4) {
                _this.elements.loadProgress.width((_this.elements.audioDom.buffered.end(0) / _this.elements.audioDom.seekable.end(0)) * _this.elements.totalPlayProgress.width());
            }
        }
        // Playing time change foo. / 播放时间更改
        ,timeupdate: function() {
            var _this = this;

            var currTime = Math.floor(_this.elements.audioDom.currentTime).toString();
            var duration = Math.floor(_this.elements.audioDom.duration).toString();

            _this.elements.currentTime.html(_this.formatTime(currTime));

            if (isNaN(duration)) {
                _this.elements.totalTime.html('00:00');
            } else {
                _this.elements.totalTime.html(_this.formatTime(duration));
            }
            _this.elements.playProgress.width((_this.elements.audioDom.currentTime / _this.elements.audioDom.duration) * $('.progress_bg').width());
        }
        // Formatting a timestamp / 格式化时间戳相关
        ,formatTime: function(secs, format) {
            var hr = Math.floor(secs / 3600);
            var min = Math.floor((secs - (hr * 3600)) / 60);
            var sec = Math.floor(secs - (hr * 3600) - (min * 60));

            if (min < 10) {
                min = "0" + min;
            }
            if (sec < 10) {
                sec = "0" + sec;
            }

            return min + ':' + sec;
        }
        // To calculate the volume / 计算音量
        ,sumVolume: function(event) {
            var _this = this;
            if (!event) {
                return false;
            }
            var num = event.pageX - _this.elements.totalVolume.offset().left;
            num = Math.max(0, Math.min(1, num / _this.elements.totalVolume.width()));
            num = parseInt(100 * num, 10);
            return num;
        }
        // reset / 重置函数
        ,reset: function(){
            var _this = this;

            // The play button to return to the initial state / 播放按钮回到初始状态
            _this.elements.playButton.find('img').attr('src', _this.options.imagePath + '/play.png');
            // The current playback time back to the initial state / 当前播放时间回到初始状态
            _this.elements.currentTime.html('00:00');
            // Total time to return to the initialization state / 总时间回到初始化状态
            _this.elements.totalTime.html('00:00');
            // The volume back to initialize the state / 音量回到初始化状态
            _this.elements.currentVolume.width(_this.elements.totalVolume);
            // Playback progress bar to initialize state / 播放进度条回到初始化状态
            _this.elements.playProgress.width(0);
            // Audio download progress bar back to the initial state / 音频下载进度条回到初始状态
            _this.elements.loadProgress.width(0);
        }
        // Custom log / 定制log
        ,log: function(log){
            var _this = this;

            if(_this.options.debuggers){
                return console.info(log);
            }
        }
    }

    jQuery.AudioPlayer = AudioPlayer;
})(jQuery);