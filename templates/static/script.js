const consultButton = document.getElementById('consult-button');
const videoElement = document.getElementById('video');
const socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

consultButton.addEventListener('click', () => {
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
      videoElement.srcObject = stream;
      videoElement.play();

      // Send video frames to the server
      const videoTrack = stream.getVideoTracks()[0];
      const videoSender = new MediaStreamTrackSender(videoTrack);
      const videoInterval = setInterval(() => {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        canvas.getContext('2d').drawImage(videoElement, 0, 0);
        const frame = canvas.toDataURL('image/jpeg');
        socket.emit('video_frame', frame);
      }, 100);

      // Stop sending video frames when the Consult button is clicked again
      consultButton.addEventListener('click', () => {
        clearInterval(videoInterval);
        videoSender.stop();
      });
    })
    .catch((error) => {
      console.error('Error accessing camera:', error);
    });

  socket.on('frame_saved', (data) => {
    console.log(`Frame saved with timestamp ${data.timestamp}`);
  });
});