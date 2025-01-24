import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';

export default function VideoRecorder() {
  const [hasPermission, setHasPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(null);

  useEffect(() => {
    (async () => {
      // Request camera permission
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      setHasPermission(status === 'granted');

      // Request microphone permission
      const { audioStatus } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    })();
  }, []);

  const startRecording = async () => {
    if (camera) {
      try {
        const videoRecordPromise = camera.recordAsync();
        if (videoRecordPromise) {
          setIsRecording(true);
          const data = await videoRecordPromise;
          setVideoUri(data.uri);
        }
      } catch (error) {
        console.error('Error while recording video', error);
      }
    }
  };

  const stopRecording = () => {
    if (camera) {
      camera.stopRecording();
      setIsRecording(false);
    }
  };

  const saveVideo = async () => {
    if (videoUri) {
      const asset = await MediaLibrary.createAssetAsync(videoUri);
      await MediaLibrary.createAlbumAsync('Expo Videos', asset, false);
      alert('Video saved!');
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={Camera.Constants.Type.back} ref={(ref) => setCamera(ref)}>
        <View style={styles.buttonContainer}>
          <Button
            title={isRecording ? "Stop Recording" : "Start Recording"}
            onPress={isRecording ? stopRecording : startRecording}
          />
          {videoUri && (
            <View style={styles.videoContainer}>
              <Video
                source={{ uri: videoUri }}
                style={styles.video}
                shouldPlay
                useNativeControls
              />
              <Button title="Save Video" onPress={saveVideo} />
            </View>
          )}
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 50,
  },
  videoContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  video: {
    width: 300,
    height: 200,
  },
});
