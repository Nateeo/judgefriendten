import React, { Component } from 'react'
import { StyleSheet, Text, View, Button } from 'react-native'
import { Accelerometer, Audio } from 'expo'

Accelerometer.setUpdateInterval(100)
const cheer = new Audio.Sound()
cheer
  .loadAsync(require('./assets/kids_cheering.mp3'))
  .then(e => console.log('loaded', e))
  .catch(e => console.log(e))

const round = n => {
  if (!n) {
    return 0
  }

  return Math.floor(n * 100) / 100
}

export default class App extends Component {
  state = {
    accel: {},
    done: false,
    sound: true,
    score: 0,
  }

  componentDidMount = () => {
    console.log('MOUNT')
    if (this.subscription) {
      this.unsubscribe()
    } else {
      this.subscribe()
    }
  }

  toggleSound = () => {
    this.setState({
      sound: !this.state.sound,
    })
  }

  subscribe = () => {
    this.subscription = Accelerometer.addListener(accel => {
      let { done, score } = this.state
      if (accel.y > 0.8) {
        if (!done) {
          const diff = accel.y - this.state.accel.y
          score = Math.min(Math.max(Math.round(diff * 10), 0), 10)
          done = true
          if (this.state.sound) {
            cheer
              .getStatusAsync()
              .then(status => {
                console.log(status)
                return status.isLoaded
              })
              .then(isLoaded => {
                if (isLoaded) {
                  cheer.playAsync().then(() => cheer.setPositionAsync(0))
                }
              })
          }
        }
      } else {
        if (this.state.done) {
          done = false
        }
      }
      this.setState({ accel, done, score })
    })
  }

  unsubscribe = () => {
    this.subscription && this.subscription.remove()
    this.subscription = null
  }

  render() {
    const { sound, score } = this.state
    return (
      <View style={styles.container}>
        <View style={styles.container}>
          <Text style={styles.score}>{score}</Text>
        </View>
        <View style={{ height: 50 }}>
          <Button
            title={sound ? 'off' : 'on'}
            onPress={this.toggleSound}
            color="#f8f8f8"
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  score: {
    fontSize: 320,
  },
})
