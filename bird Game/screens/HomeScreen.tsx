import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const WINDOW_WIDTH = Dimensions.get('window').width;

export default function GameScreen() {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const birdPosition = new Animated.Value(WINDOW_HEIGHT / 2);
  const [obstaclePosition] = useState(new Animated.Value(WINDOW_WIDTH));
  const [obstacleHeight, setObstacleHeight] = useState(generateRandomHeight());

  function generateRandomHeight() {
    return Math.floor(Math.random() * (WINDOW_HEIGHT / 2));
  }

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    birdPosition.setValue(WINDOW_HEIGHT / 2);
    moveObstacle();
  };

  const moveObstacle = () => {
    Animated.timing(obstaclePosition, {
      toValue: -60,
      duration: 2500,
      useNativeDriver: true,
    }).start(() => {
      obstaclePosition.setValue(WINDOW_WIDTH);
      setObstacleHeight(generateRandomHeight());
      setScore(score + 1);
      if (gameStarted && !gameOver) moveObstacle();
    });
  };

  const jump = () => {
    if (gameOver) return;
    Animated.sequence([
      Animated.timing(birdPosition, {
        toValue: birdPosition._value - 50,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(birdPosition, {
        toValue: birdPosition._value + 50,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const gravity = setInterval(() => {
        birdPosition.setValue(birdPosition._value + 2);
        
        // Basic collision detection
        if (birdPosition._value > WINDOW_HEIGHT || birdPosition._value < 0) {
          setGameOver(true);
          setGameStarted(false);
          clearInterval(gravity);
        }
      }, 15);

      return () => clearInterval(gravity);
    }
  }, [gameStarted, gameOver]);

  return (
    <SafeAreaView style={styles.container}>
      {!gameStarted ? (
        <View style={styles.startScreen}>
          <Text style={styles.title}>Bird Adventure</Text>
          <MaterialCommunityIcons name="bird" size={64} color="#FFD700" />
          {gameOver && <Text style={styles.score}>Final Score: {score}</Text>}
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>
              {gameOver ? 'Play Again' : 'Start Game'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.gameArea} onPress={jump} activeOpacity={1}>
          <Animated.View
            style={[
              styles.bird,
              {
                transform: [{ translateY: birdPosition }],
              },
            ]}>
            <MaterialCommunityIcons name="bird" size={40} color="#FFD700" />
          </Animated.View>
          
          <Animated.View
            style={[
              styles.obstacle,
              {
                height: obstacleHeight,
                transform: [{ translateX: obstaclePosition }],
              },
            ]}
          />
          
          <Text style={styles.scoreText}>Score: {score}</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  startScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
  },
  bird: {
    position: 'absolute',
    left: 50,
  },
  obstacle: {
    position: 'absolute',
    width: 60,
    backgroundColor: '#2E7D32',
    left: 0,
  },
  scoreText: {
    position: 'absolute',
    top: 50,
    right: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  score: {
    fontSize: 24,
    color: 'white',
    marginTop: 20,
  },
});