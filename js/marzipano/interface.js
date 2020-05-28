/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var video = threeSixtyVideo.element;

var progressFillElement = document.getElementById('progress-fill');
var progressBackgroundElement = document.getElementById('progress-background');
var currentTimeIndicatorElement = document.getElementById('current-time-indicator');
var durationIndicatorElement = document.getElementById('duration-indicator');
var playPauseElement = document.getElementById('play-pause');
var muteElement = document.getElementById('mute');
var rootElement = document.body;

/* Video interface */

// Handle events on the video element. threeSixtyVideo automatically reattaches
// handlers to new video when the resolution changes
threeSixtyVideo.addEventListenerVideo('timeupdate', updateProgressBar);
threeSixtyVideo.addEventListenerVideo('pause', updatePlayPause);
threeSixtyVideo.addEventListenerVideo('play', updatePlayPause);
threeSixtyVideo.addEventListenerVideo('playing', updatePlayPause);
threeSixtyVideo.addEventListenerVideo('timeupdate', updateCurrentTimeIndicator);
threeSixtyVideo.addEventListenerVideo('volumechange', updateMute);

// Handle resolution change
threeSixtyVideo.addEventListener('change', updateCurrentTimeIndicator);
threeSixtyVideo.addEventListener('change', updateDurationIndicator);
threeSixtyVideo.addEventListener('change', updateProgressBar);
threeSixtyVideo.addEventListener('change', updatePlayPause);
threeSixtyVideo.addEventListener('change', updateMute);

// Set starting state
updateProgressBar();
updatePlayPause();
updateCurrentTimeIndicator();
updateDurationIndicator();
updateMute();

playPauseElement.addEventListener('click', function() {
  if (!video()) {
    return;
  }
  if (video().paused) {
    video().play();
  } else {
    video().pause();
  }
});

muteElement.addEventListener('click', function() {
  if (!video()) {
    return;
  }
  var newVolume = video().volume > 0 ? 0 : 1;
  video().volume = newVolume;
});

progressBackgroundElement.addEventListener('click', function(evt) {
  if (!video()) {
    return;
  }
  video().currentTime = percentFromClick(evt) * video().duration;
});

function updateProgressBar() {
  if (!video()) {
    return;
  }
  var progress = video().currentTime / video().duration;
  progressFillElement.style.width = (progress * 100) + '%';
}

function updateCurrentTimeIndicator() {
  currentTimeIndicatorElement.innerHTML = video() ? formatTime(video().currentTime) : '-';
}

function updateDurationIndicator() {
  durationIndicatorElement.innerHTML = video() ? formatTime(video().duration) : '-';
}

function updatePlayPause() {
  if (!video()) {
    return;
  }
  if (video().paused) {
    rootElement.classList.remove('video-playing');
    rootElement.classList.add('video-paused');
  } else {
    rootElement.classList.add('video-playing');
    rootElement.classList.remove('video-paused');
  }
}

function updateMute() {
  if (!video()) {
    return;
  }
  if (video().volume === 0) {
    rootElement.classList.add('video-muted');
  } else {
    rootElement.classList.remove('video-muted');
  }
}

function percentFromClick(evt) {
  var rect = progressBackgroundElement.getBoundingClientRect();
  var click = evt.clientX - rect.left;
  var total = rect.right - rect.left;
  return click / total;
}

function formatTime(d) {
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);
  return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}

/* Options modal */

var toggleOptionsElement = document.getElementById('toggle-options');

toggleOptionsElement.addEventListener('click', function() {
  updateOptionsOpen();
});

function updateOptionsOpen() {
  rootElement.classList.remove('resolution-select-open');

  if (rootElement.classList.contains('options-open')) {
    rootElement.classList.remove('options-open');
  } else {
    rootElement.classList.add('options-open');
  }
}

/* Effects */

var Marzipano = window.Marzipano;

var effectElement = document.getElementById('effect');

effectElement.addEventListener('change', function() {
  var layer = multiResVideo.layer();

  if(!layer) { return; }

  var effect = effectElement.value;
  var effectsObj = { colorMatrix: null, colorOffset: null };
  if (effect === 'desaturate') {
    effectsObj = window.colorEffects.saturation(0);
  } else if(effect === 'sepia') {
    effectsObj = window.colorEffects.sepia(1);
  } else if(effect === 'saturate') {
    effectsObj = window.colorEffects.saturation(1.25);
  } else if(effect === 'lighten') {
    effectsObj = window.colorEffects.brightness(0.1);
  } else if(effect === 'darken') {
    effectsObj = window.colorEffects.brightness(-0.1);
  }

  layer.mergeEffects(effectsObj);
});
