/**
 * jQuery音频播放
 * @Author syantao
 * Created by Keystion on 2016-12-19
 * @param  {[type]} jQuery [description]
 */
;(function(jQuery){
    "use strict";
    var AudioPlayer = {
        options: {
            debuggers: false,           // 是否开启播放记录
            container: 'body',               // 把组件塞到什么地方
            source: '',                 // 音频源文件
            imagePath: './image',                 // 音频源文件
            seekNum: 0,                 // 拖拽是判断之前是否播放
            allowSeek: true,            // 是否可以拖拽
            canplayCallback: null,      // 可以播放之后，做某些事情
            playCallback: null,         // 播放之后，做某些事情
            pauseCallback: null,        // 暂停之后，做某些事情
            timeupdateCallback: null,   // 拖动之后，做某些事情
            endedCallback: null,        // 播放结束之后，做某些事情
            mutedCallback: null,        // 静音之后，做某些事情
            template: $('<div id="componentWrapper">' +
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
        },
        elements: {},
        init: function(options) {
            var _this = this;
            if (!options || !options.container) {
                return false;
            }
            this.options = $.extend(this.options, options);

            // audio DOM
            _this.elements.audioDom = _this.options.template.find('audio')[0];
            // 播放按钮
            _this.elements.playButton = _this.options.template.find('.controls_toggle');
            // 当前时间
            _this.elements.currentTime = _this.options.template.find('.player_mediaTime_current');
            // 总时长
            _this.elements.totalTime = _this.options.template.find('.player_mediaTime_total');
            // 加载进度条
            _this.elements.loadProgress = _this.options.template.find('.load_progress');
            // 播放进度条
            _this.elements.playProgress = _this.options.template.find('.play_progress');
            // 播放进度条wrap
            _this.elements.playProgressWrap = _this.options.template.find('.player_progress');
            // 播放进度条总长
            _this.elements.totalPlayProgress = _this.options.template.find('.progress_bg');
            // 静音按钮
            _this.elements.mutedButton = _this.options.template.find('.player_volume');
            // 音量大小wrap
            _this.elements.volumeWrap = _this.options.template.find('.volume_seekbar');
            // 音量总长
            _this.elements.totalVolume = _this.options.template.find('.volume_bg');
            // 当前音量
            _this.elements.currentVolume = _this.options.template.find('.volume_level');
            // 音量提示条
            _this.elements.tipsVolume = _this.options.template.find('.player_volume_tooltip');
            $(_this.options.container).append(_this.options.template);

            _this.elements.playButton.find('img').attr('src', _this.options.imagePath + '/play.png');
            _this.elements.mutedButton.find('img').attr('src', _this.options.imagePath + '/volume.png');

            if(options.source){
                _this.updateSource({source: options.source, callback: function(){ _this.log('update source') }});
            }

            _this.elements.currentVolume.width((60 / 100 * _this.elements.audioDom.volume * 100) + 'px');

            // 初始化话事件
            _this.events();
        },
        // 更新音频源
        updateSource: function(o){
            var _this = this;
            // 重置
            _this.reset();

            // 更新音频来源
            _this.elements.audioDom.setAttribute('src', o.source);

            if(typeof o.callback == 'function'){
                o.callback();
            }
        },
        // dom 绑定事件
        events: function() {
            var _this = this;

            // 调节声音大小
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

            // 播放进度条
            if(_this.options.allowSeek){
                _this.elements.playProgressWrap.on('mousedown', function(event) {
                    event.preventDefault();
                    if (_this.elements.audioDom.paused) {
                        _this.options.seekNum = 1;
                    } else {
                        _this.options.seekNum = 2;
                        _this.pause();
                    }
                    // 鼠标按下就更新进度条
                    _this.setPlayProgressWidth(event);
                }).on('mousemove', function(event) {
                    event.preventDefault();
                    // 判断是否已经开始移动 才会设置进度条
                    _this.options.seekNum != 0 && _this.setPlayProgressWidth(event);
                }).on('mouseup', function(event) {
                    event.preventDefault();
                    // TODO 是否有必要在鼠标按键抬起的时候再次去更新播放进度条宽度
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

            // 播放暂停
            _this.elements.playButton.on('click', function(event) {
                event.preventDefault();
                _this.toggleplay({
                    playCallback: function(){ _this.log('toggleplay：play') },
                    pauseCallback: function(){ _this.log('toggleplay：pause') }
                });
            })

            // 当音频的加载已放弃时
            _this.elements.audioDom.onabort = function() {
                _this.log('onabort');

                _this.reset();
            }

            // 当浏览器可以播放音频时
            _this.elements.audioDom.oncanplay = function() {
                _this.log('oncanplay');
                // 判断音频加载完毕
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

            // 当浏览器正在下载音频时
            _this.elements.audioDom.onprogress = function() {
                if (_this.elements.audioDom.readyState == 4) {
                    _this.elements.loadProgress.width((_this.elements.audioDom.buffered.end(0) / _this.elements.audioDom.seekable.end(0)) * _this.elements.totalPlayProgress.width());
                }
            };

            // 当浏览器开始查找音频时
            _this.elements.audioDom.onloadstart = function() {
                _this.log('onloadstart');
            }

            // 当音频已开始或不再暂停时
            _this.elements.audioDom.onplay = function() {
                _this.log('onplay');
                _this.elements.playButton.find('img').attr('src', _this.options.imagePath + '/pause.png');
            }

            // 当音频已暂停时
            _this.elements.audioDom.onpause = function() {
                _this.log('onpause');
                _this.elements.playButton.find('img').attr('src', _this.options.imagePath + '/play.png');
            }

            // 当目前的播放列表已结束时
            _this.elements.audioDom.onended = function() {
                _this.log('onended');

                if(typeof _this.options.endedCallback == 'function'){
                    _this.options.endedCallback({'status': _this.elements.audioDom.ended});
                }
            }

            // 当用户开始移动/跳跃到音频中的新位置时
            _this.elements.audioDom.onseeking = function() {
                _this.log('onseeking');
            }

            // 当用户已移动/跳跃到音频中的新位置时
            _this.elements.audioDom.onseeked = function() {
                _this.log('onseeked');
            }

            // 当目前的播放位置已更改时
            _this.elements.audioDom.ontimeupdate = function() {
                _this.log('ontimeupdate');
                _this.timeupdate();
            }

            // 当音量已更改时
            _this.elements.audioDom.onvolumechange = function() {
                _this.log('onvolumechange');
                _this.setvolume();
            }
        },
        // 切换播放/暂停
        toggleplay: function(o) {
            var _this = this;
            if (_this.elements.audioDom.paused) {
                _this.play(o.playCallback);
            } else {
                _this.pause(o.pauseCallback);
            }
        },
        // 设置播放
        play: function(o) {
            var _this = this;
            _this.elements.audioDom.play();
            if (typeof o == 'function') {
                o({'status': _this.elements.audioDom.play});
            }

            if(typeof _this.options.playCallback == 'function'){
                _this.options.playCallback({'status': _this.elements.audioDom.play});
            }
        },
        // 设置暂停
        pause: function(o) {
            var _this = this;
            _this.elements.audioDom.pause();
            if (typeof o == 'function') {
                o({'status': _this.elements.audioDom.play});
            }

            if(typeof _this.options.pauseCallback == 'function'){
                _this.options.pauseCallback({'status': _this.elements.audioDom.play});
            }
        },
        // 设置静音否
        muted: function(o) {
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
        },
        // 设置声音大小
        setvolume: function(options) {
            var _this = this;
            if (!options) {
                _this.elements.currentVolume.width((_this.elements.totalVolume.width() / 100 * _this.elements.audioDom.volume * 100) + 'px');
            } else {
                if (options.event) {
                    return _this.elements.audioDom.volume = _this.sumVolume(options.event) / 100;
                } else {
                    // _this.log 需要优化
                    _this.options.debuggers && console.error('缺少参数：options.event');
                    return false;
                }
            }
        },
        // 设置播放进度条
        setPlayProgressWidth: function(argument) {
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
        },
        // 播放时间更改
        timeupdate: function() {
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
        },
        // 格式化时间戳相关
        formatTime: function(secs, format) {
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
        },
        // 计算音量
        sumVolume: function(event) {
            var _this = this;
            if (!event) {
                return false;
            }
            var num = event.pageX - _this.elements.totalVolume.offset().left;
            num = Math.max(0, Math.min(1, num / _this.elements.totalVolume.width()));
            num = parseInt(100 * num, 10);
            return num;
        },
        // 重置函数
        reset: function(){
            var _this = this;

            // 播放按钮 当前播放时间 总时间 音量 播放进度条 下载进度条
            _this.elements.playButton.find('img').attr('src', _this.options.imagePath + '/play.png');
            _this.elements.currentTime.html('00:00');
            _this.elements.totalTime.html('00:00');
            _this.elements.currentVolume.width(_this.elements.totalVolume);
            _this.elements.playProgress.width(0);
            _this.elements.loadProgress.width(0);
        },
        log: function(log){
            var _this = this;

            if(_this.options.debuggers){
                return console.info(log);
            }
        }
    }

    jQuery.AudioPlayer = AudioPlayer;
})(jQuery);