const canvas = document.getElementById('image');
const ctx = canvas.getContext('2d');
var x = 0;
const stream = canvas.captureStream(); // grab our canvas MediaStream
const rec = new MediaRecorder(stream); 

function exportVid(blob) {
  const vid = document.createElement('video');
  vid.src = URL.createObjectURL(blob);
  vid.controls = true;
  vid.style.display='none';
  document.body.appendChild(vid);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = vid.src;
  a.download = 'infragramVideo.mp4';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(vid.src);
  }, 100);
}
$('#startRecord').click(function(e){
  const chunks = [];

  rec.ondataavailable = e => chunks.push(e.data);
  rec.onstop = e => exportVid(new Blob(chunks, {type: 'video/h264'}));
  rec.start();
  document.getElementById('startRecord').style.display='none';
  document.getElementById('stopRecord').style.display='block';
})
$('#stopRecord').click(function(e){
  rec.stop();
  document.getElementById('stopRecord').style.display='none';
  document.getElementById('startRecord').style.display='block'; 
  document.getElementById('downloadButton').style.display='block'; 
})