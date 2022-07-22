
/*
*  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

'use strict';

/* globals main */

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

/* globals main, MediaRecorder */

const mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
let mediaRecorder;
let recordedBlobs;
let sourceBuffer;

const canvas = document.querySelector('canvas');
const video = document.getElementById('recorded2');

const recordButton = document.getElementById('record2');
const playButton = document.getElementById('play2');
const downloadButton = document.getElementById('download2');
recordButton.onclick = toggleRecording;
playButton.onclick = play;
downloadButton.onclick = download;


const stream = canvas.captureStream(); // frames per second
console.log('Started stream capture from canvas element: ', stream);

function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', sourceBuffer);
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function handleStop(event) {
  console.log('Recorder stopped: ', event);
  const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
  video.src = window.URL.createObjectURL(superBuffer);
}

function toggleRecording() {
  if (recordButton.textContent === 'Start Recording') {
    startRecording();
  } else {
    stopRecording();
    recordButton.textContent = 'Start Recording';
    playButton.disabled = false;
    downloadButton.disabled = false;
  }
}

// The nested try blocks will be simplified when Chrome 47 moves to Stable
function startRecording() {
  let options = {mimeType: 'video/webm'};
  recordedBlobs = [];
  try {
    mediaRecorder = new MediaRecorder(stream, options);
  } catch (e0) {
    console.log('Unable to create MediaRecorder with options Object: ', e0);
    try {
      options = {mimeType: 'video/webm,codecs=vp9'};
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (e1) {
      console.log('Unable to create MediaRecorder with options Object: ', e1);
      try {
        options = 'video/vp8'; // Chrome 47
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e2) {
        alert('MediaRecorder is not supported by this browser.\n\n' +
          'Try Firefox 29 or later, or Chrome 47 or later, ' +
          'with Enable experimental Web Platform features enabled from chrome://flags.');
        console.error('Exception while creating MediaRecorder:', e2);
        return;
      }
    }
  }
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  recordButton.textContent = 'Stop Recording';
  playButton.disabled = true;
  downloadButton.disabled = true;
  mediaRecorder.onstop = handleStop;
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(100); // collect 100ms of data
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
  console.log('Recorded Blobs: ', recordedBlobs);
  video.controls = true;
}

function play() {
  video.play();
}

function download() {
  const blob = new Blob(recordedBlobs, {type: 'video/webm'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}




                var recordVideo;
                var videoPreview = document.getElementById('video-preview');
                var inner = document.querySelector('.inner');

                document.querySelector('#record-video').onclick = function() {
                    this.disabled = true;
                    navigator.getUserMedia({
                            video: true
                        }, function(stream) {
                            videoPreview.srcObject = stream;
                            videoPreview.play();

                            recordVideo = RecordRTC(stream, {
                                type: 'video'
                            });

                            recordVideo.startRecording();
                        }, function(error) { throw error;});
                    document.querySelector('#stop-recording-video').disabled = false;
                };

                document.querySelector('#stop-recording-video').onclick = function() {
                    this.disabled = true;

                    recordVideo.stopRecording(function(url) {
                        videoPreview.src = url;
                        videoPreview.download = 'video.webm';

                        log('<a href="'+ workerPath +'" download="ffmpeg-asm.js">ffmpeg-asm.js</a> file download started. It is about 18MB in size; please be patient!');
                        convertStreams(recordVideo.getBlob());
                    });
                };

                var workerPath = 'https://archive.org/download/ffmpeg_asm/ffmpeg_asm.js';
                if(document.domain == 'localhost') {
                    workerPath = location.href.replace(location.href.split('/').pop(), '') + 'ffmpeg_asm.js';
                }

                function processInWebWorker() {
                    var blob = URL.createObjectURL(new Blob(['importScripts("' + workerPath + '");var now = Date.now;function print(text) {postMessage({"type" : "stdout","data" : text});};onmessage = function(event) {var message = event.data;if (message.type === "command") {var Module = {print: print,printErr: print,files: message.files || [],arguments: message.arguments || [],TOTAL_MEMORY: message.TOTAL_MEMORY || false};postMessage({"type" : "start","data" : Module.arguments.join(" ")});postMessage({"type" : "stdout","data" : "Received command: " +Module.arguments.join(" ") +((Module.TOTAL_MEMORY) ? ".  Processing with " + Module.TOTAL_MEMORY + " bits." : "")});var time = now();var result = ffmpeg_run(Module);var totalTime = now() - time;postMessage({"type" : "stdout","data" : "Finished processing (took " + totalTime + "ms)"});postMessage({"type" : "done","data" : result,"time" : totalTime});}};postMessage({"type" : "ready"});'], {
                        type: 'application/javascript'
                    }));

                    var worker = new Worker(blob);
                    URL.revokeObjectURL(blob);
                    return worker;
                }

                var worker;

                function convertStreams(videoBlob) {
                    var aab;
                    var buffersReady;
                    var workerReady;
                    var posted;

                    var fileReader = new FileReader();
                    fileReader.onload = function() {
                        aab = this.result;
                        postMessage();
                    };
                    fileReader.readAsArrayBuffer(videoBlob);

                    if (!worker) {
                        worker = processInWebWorker();
                    }

                    worker.onmessage = function(event) {
                        var message = event.data;
                        if (message.type == "ready") {
                            log('<a href="'+ workerPath +'" download="ffmpeg-asm.js">ffmpeg-asm.js</a> file has been loaded.');

                            workerReady = true;
                            if (buffersReady)
                                postMessage();
                        } else if (message.type == "stdout") {
                            log(message.data);
                        } else if (message.type == "start") {
                            log('<a href="'+ workerPath +'" download="ffmpeg-asm.js">ffmpeg-asm.js</a> file received ffmpeg command.');
                        } else if (message.type == "done") {
                            log(JSON.stringify(message));

                            var result = message.data[0];
                            log(JSON.stringify(result));

                            var blob = new File([result.data], 'test.mp4', {
                                type: 'video/mp4'
                            });

                            log(JSON.stringify(blob));

                            PostBlob(blob);
                        }
                    };
                    var postMessage = function() {
                        posted = true;

                        worker.postMessage({
                            type: 'command',
                            arguments: '-i video.webm -c:v mpeg4 -b:v 6400k -strict experimental output.mp4'.split(' '),
                            files: [
                                {
                                    data: new Uint8Array(aab),
                                    name: 'video.webm'
                                }
                            ]
                        });
                    };
                }

                function PostBlob(blob) {
                    var video = document.createElement('video');
                    video.controls = true;

                    var source = document.createElement('source');
                    source.src = URL.createObjectURL(blob);
                    source.type = 'video/mp4; codecs=mpeg4';
                    video.appendChild(source);

                    video.download = 'Play mp4 in VLC Player.mp4';

                    inner.appendChild(document.createElement('hr'));
                    var h2 = document.createElement('h2');
                    h2.innerHTML = '<a href="' + source.src + '" target="_blank" download="Play mp4 in VLC Player.mp4" style="font-size:200%;color:red;">Download Converted mp4 and play in VLC player!</a>';
                    inner.appendChild(h2);
                    h2.style.display = 'block';
                    inner.appendChild(video);

                    video.tabIndex = 0;
                    video.focus();
                    video.play();

                    document.querySelector('#record-video').disabled = false;
                }

                var logsPreview = document.getElementById('logs-preview');

                function log(message) {
                    var li = document.createElement('li');
                    li.innerHTML = message;
                    logsPreview.appendChild(li);

                    li.tabIndex = 0;
                    li.focus();
                }

                window.onbeforeunload = function() {
                    document.querySelector('#record-video').disabled = false;
                };