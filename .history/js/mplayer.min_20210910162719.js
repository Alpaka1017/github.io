/**
 * MPlayer音乐播放器
 * @authors 0936zz(zz5840@qq.com)
 * 本插件依赖：jQuery 1.6及以上
 */
var MPlayer = function () {
    function t(t, e) {
        function r(e) {
            l.settings = {
                playMode: 3,
                playList: 0,
                playSong: 0,
                autoPlay: !1,
                lrcTopPos: 0,
                defaultVolume: 100
            }, l.callbacks = {
                afterInit: null,
                beforePlay: null,
                timeUpdate: null,
                end: null,
                mute: null,
                changeMode: null
            }, $.extend(!0, l.settings, t);
            var r = $(l.settings.containerSelector);
            l.audio = $("<audio></audio>").attr({
                "data-currentLrc": 0,
                "data-currentSong": 0,
                "data-currentList": 0,
                "data-displayList": 0,
                "data-playMode": 0,
                preload: "preload"
            }), l.dom = {
                container: r,
                cover: r.find(".mp-cover"),
                name: r.find(".mp-name"),
                singer: r.find(".mp-singer"),
                currentTime: r.find(".mp-time-current"),
                allTime: r.find(".mp-time-all"),
                prev: r.find(".mp-prev"),
                play: r.find(".mp-pause"),
                next: r.find(".mp-next"),
                vol: r.find(".mp-vol-img"),
                volRange: r.find(".mp-vol-range"),
                progress: r.find(".mp-pro-current"),
                progressAll: r.find(".mp-pro"),
                lrc: r.find(".mp-lrc"),
                listTitle: r.find(".mp-list-title"),
                list: r.find(".mp-list")
            }, l.settings.lineHeight = parseInt(l.dom.lrc.css("line-height")), l.settings.listEleName = $.parseHTML(l.settings.listFormat)[0].nodeName.toLowerCase(), e.apply(l)
        }

        function n() {
            l.dom.cover.error(function () {
                $(this).attr("src", l.settings.defaultImg)
            }), l.dom.prev.click(function () {
                l.prev()
            }), l.dom.next.click(function () {
                l.next()
            }), l.dom.play.click(function () {
                l.audio.prop("paused") ? l.play() : l.pause()
            }), l.dom.volRange.on(l.settings.volSlideEventName, function (t, e) {
                l.audio.prop("volume", e / 100)
            }), l.dom.vol.click(function () {
                l.toggleMute()
            }), l.dom.listTitle.on("click", "li", function () {
                var t = $(this).index();
                l.changeList(t)
            }), l.audio.on("canplay", function () {
                s(l.getDuration(), l.dom.allTime)
            }).on("timeupdate", function () {
                var t = l.getCurrentTime();
                s(t, l.dom.currentTime), l.dom.progress.css("width", 100 * l.getPercent() + "%");
                var e = parseInt(l.audio.attr("data-currentLrc")),
                    r = l.getLrc(t, !1);
                if (e != r) {
                    l.audio.attr("data-currentLrc", r), l.dom.lrc.find(".mp-lrc-current").removeClass("mp-lrc-current");
                    var n = l.dom.lrc.find(".mp-lrc-time-" + r).addClass("mp-lrc-current").position(),
                        i = n ? n.top : 0,
                        a = l.dom.lrc.scrollTop();
                    l.dom.lrc.animate({
                        scrollTop: a + i - l.settings.lrcTopPos
                    }, 200)
                }
                l._trigger("timeUpdate")
            }).on("ended", function () {
                var t = l._trigger("end");
                t !== !1 && a()
            });
            var t = $.parseHTML(l.settings.listFormat)[0].nodeName.toLowerCase();
            l.dom.list.on("click", t, function () {
                l.play(parseInt(l.audio.attr("data-displayList")), $(this).index())
            }), l.dom.progressAll.click(function (t) {
                var e = $(this).width(),
                    r = Math.min(Math.max(t.offsetX, 0), e),
                    n = r / e;
                l.setCurrentTime(l.getDuration() * n)
            }), l.dom.list.on("click", l.settings.listEleName, function () {
                l.play(parseInt(l.audio.attr("data-displayList")), $(this).index())
            }), l.dom.container.on("mousedown", ".mp-disabled", function () {
                return !1
            })
        }

        function i() {
            l.list = [];
            for (var t = l.settings.songList, e = 0; e < t.length; e++) {
                l.list[e] = [];
                for (var r = 0; r < t[e].length; r++)
                    if (t[e][r].basic) {
                        l.list[e].listName = t[e][r].name || "-", l.list[e].singerName = t[e][r].singer || "-", l.list[e].imgSrc = t[e][r].img || l.settings.defaultImg, t[e].splice(r, 1);
                        break
                    } l.addSong(t[e], e)
            }
        }

        function a() {
            var t = parseInt(l.audio.attr("data-playMode")),
                e = l.getSongNum();
            switch (t) {
                case 0:
                    var r = l.audio.attr("data-currentSong");
                    r != e - 1 ? l.next() : l.pause();
                    break;
                case 1:
                    l.play();
                    break;
                case 2:
                case 3:
                default:
                    l.next()
            }
        }

        function s(t, e) {
            var r = o(Math.floor(t / 60), 2),
                n = o(Math.floor(t % 60), 2);
            e.html(r + ":" + n)
        }

        function o(t, e) {
            t = String(t);
            for (var r = t.length; e > r; r++) t = "0" + t;
            return t
        }
        var l = this;
        r(e), n(), i(), l.changePlayMode(l.settings.playMode);
        var u = "";
        $.each(l.list, function (t) {
            u += '<li class="mp-list-title-' + t + '">' + l.list[t].listName + "</li>"
        }), l.dom.listTitle.html(u), l._setLrc(l.list[0][0].lrc), l.changeList(l.settings.playList), l._trigger("afterInit"), l.settings.autoPlay ? l.play(l.settings.playList, l.settings.playSong) : l._setInfo(l.settings.playList, l.settings.playSong)
    }
    return $.extend(t.prototype, {
        _setLrc: function (t) {
            var e = this;
            e.dom.lrc.html("").scrollTop(0), $.each(t, function (t, r) {
                e.dom.lrc.append($("<li></li>").addClass("mp-lrc-time-" + t).html(r))
            })
        },
        _setInfo: function (t, e) {
            var r = this,
                n = r.getInfo(t, e);
            r.audio.attr({
                src: n.src,
                "data-currentList": t,
                "data-currentSong": e
            }), r.dom.name.html(n.name), r.dom.singer.html(n.singer), r.dom.cover.attr("src", n.img), r._setLrc(n.lrc), r.dom.progress.width(0), t == r.getDisplayList() && r._setCurrent(e)
        },
        _setCurrent: function (t) {
            var e = this,
                r = e.dom.list;
            r.find(".mp-list-current").removeClass("mp-list-current"), r.children().eq(t).addClass("mp-list-current")
        },
        _parseLrc: function (t) {
            for (var e = /\[(\d{2})(&#58;|:)(\d{2})(&#46;|\.)(\d{2})\]([^\[]+)/g, r = {};;) {
                var n = e.exec(t);
                if (!n) break;
                var i = Math.round(1e3 * (60 * parseInt(n[1]) + parseInt(n[3]) + parseInt(n[5]) / 100));
                r[i] = $.trim(n[6]) || " "
            }
            return r
        },
        _trigger: function (t) {
            var e = this;
            return e.callbacks[t] && e.callbacks[t].apply(e)
        },
        _rand: function (t, e) {
            void 0 === e && (e = t, t = 0);
            var r = 0;
            do r = Math.round(Math.random() * e); while (t > r);
            return r
        },
        next: function () {
            var t = this,
                e = t.getPlayMode(),
                r = t.getSongNum();
            switch (e) {
                case 2:
                    var n = t._rand(0, r - 1);
                    t.play(n);
                    break;
                case 0:
                case 3:
                case 1:
                default:
                    var i = t.getCurrentSong() + 1;
                    i >= r && (i = 0), t.play(i)
            }
        },
        prev: function () {
            var t = this,
                e = t.getCurrentSong() - 1,
                r = t.getCurrentList(!0);
            0 > e && (e = r.num - 1), t.play(e)
        },
        play: function (t, e) {
            var r = this;
            if (void 0 === t && void 0 === e) {
                var n = r._trigger("beforePlay");
                if (n === !1) return !1;
                r.audio.get(0).play(), r.dom.play.addClass("mp-play")
            } else if (void 0 !== t && void 0 === e) e = t, t = r.getCurrentList(), r.play(t, e);
            else {
                var i = r.getSongNum(t);
                e >= i ? e = i - 1 : 0 > e && (e = 0), r._setInfo(t, e), r.play()
            }
        },
        pause: function () {
            var t = this;
            t.dom.play.removeClass("mp-play"), t.audio.get(0).pause()
        },
        getDuration: function () {
            return this.audio.prop("duration")
        },
        getCurrentTime: function () {
            return this.audio.prop("currentTime")
        },
        getPercent: function () {
            return this.getCurrentTime() / this.getDuration()
        },
        setCurrentTime: function (t) {
            var e = this;
            t = Math.min(t, e.getDuration()), t = Math.max(0, t);
            var r = e.audio.get(0).buffered,
                n = r.start(0),
                i = r.end(0);
            t = Math.max(n, Math.min(i, t)), e.audio.prop("currentTime", t)
        },
        addSong: function (t, e) {
            var r = this;
            if (e = void 0 !== e ? e : r.getCurrentList(), t instanceof Array)
                for (var n = 0; n < t.length; n++) r.addSong(t[n], e);
            else {
                var i = {
                        lrc: r._parseLrc(t.lrc || "-"),
                        name: t.name || "-",
                        singer: t.singer || r.list[e].singerName,
                        src: t.src || "-",
                        img: t.img || r.list[e].imgSrc
                    },
                    a = $.extend({}, t, i);
                r.list[e].push(a), e == r.getCurrentList() && r.changeList(e)
            }
        },
        getSongNum: function (t) {
            var e = this;
            return t = void 0 !== t ? t : e.getCurrentList(), e.list[t].length
        },
        getCurrentSong: function (t) {
            var e = this;
            return t = void 0 !== t ? t : !1, t ? e.getInfo() : parseInt(e.audio.attr("data-currentSong"))
        },
        getCurrentList: function (t) {
            var e = this;
            return t = void 0 !== t ? t : !1, t ? e.getList(e.getCurrentList()) : parseInt(e.audio.attr("data-currentList"))
        },
        getDisplayList: function (t) {
            var e = this;
            return t = void 0 !== t ? t : !1, t ? e.getList(e.getDisplayList()) : parseInt(e.audio.attr("data-displayList"))
        },
        getList: function (t) {
            var e = this,
                r = e.list[t];
            return {
                name: r.listName,
                num: r.length,
                songs: r
            }
        },
        getInfo: function (t, e) {
            var r = this;
            return t = void 0 !== t ? t : r.getCurrentList(), e = void 0 !== e ? e : r.getCurrentSong(), r.list[t][e]
        },
        getLrc: function (t, e) {
            var r = this;
            e = void 0 !== e ? e : !0, t = void 0 !== t ? 1e3 * t : 1e3 * r.getCurrentTime();
            var n, i = r.getCurrentSong(!0).lrc,
                a = 0;
            return $.each(i, function (e) {
                return e > t ? !1 : void(a = e)
            }), n = a, e ? r.getCurrentSong(!0).lrc[n] : n
        },
        changeList: function (t) {
            var e = this;
            e.dom.listTitle.find(".mp-list-title-current").removeClass("mp-list-title-current"), e.dom.listTitle.find(".mp-list-title-" + t).addClass("mp-list-title-current"), e.audio.attr("data-displayList", t), e.dom.list.html("");
            for (var r = e.settings.listFormat, n = /\$\{(\w+)}\$/g, i = 0; i < e.list[t].length; i++) {
                for (var a = r;;) {
                    var s = n.exec(r);
                    if (!s) break;
                    a = a.replace(s[0], e.list[t][i][s[1]] || "-")
                }
                e.dom.list.append(a)
            }
            t == e.getCurrentList() && e._setCurrent(e.getCurrentSong())
        },
        changePlayMode: function (t) {
            var e = this;
            t = Math.max(Math.min(parseInt(t), 3), 0), e.audio.attr("data-playMode", t), e._trigger("changeMode")
        },
        getPlayMode: function () {
            return parseInt(this.audio.attr("data-playMode"))
        },
        getIsMuted: function () {
            return this.audio.prop("muted")
        },
        mute: function () {
            var t = this;
            t.dom.vol.addClass("mp-mute"), t.audio.prop("muted", !0), t._trigger("mute")
        },
        cancelMute: function () {
            var t = this;
            t.audio.prop("muted", !1), t.dom.vol.removeClass("mp-mute"), t._trigger("mute")
        },
        toggleMute: function () {
            var t = this;
            t.getIsMuted() ? t.cancelMute() : t.mute()
        },
        on: function (t, e) {
            var r = this;
            return r.callbacks[t] = e, r
        },
        unBindEvent: function (t) {
            var e = this;
            return e.callbacks[t] = null, e
        }
    }), t
}();