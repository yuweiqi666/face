const video = document.querySelector('#video')

const startVideo = () => {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.log(err)
  )
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./models'),
]).then(startVideo())

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  const videoContent = document.querySelector('.video-content')
  videoContent.append(canvas)

  const displaySize = {
    width: video.width,
    height: video.height,
  }

  faceapi.matchDimensions(canvas, displaySize)

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()

    const resizedDetections = faceapi.resizeResults(detections, displaySize)

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})


var btn = document.querySelector('button')

btn.addEventListener('click', handlePhoto)

Webcam.set({
  width: 320,
  height: 240,
  image_format: 'jpeg',
  jpeg_quality: 90
});
Webcam.attach('#my_camera');


function handlePhoto () {
  Webcam.snap(function (data_uri) {
    // display results in page
    document.getElementById('results').innerHTML =
      '<h2>Here is your image:</h2>' +
      '<img src="' + data_uri + '"/>';
  });
}
