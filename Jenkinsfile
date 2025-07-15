pipeline {
    agent any

    tools {
        nodejs 'nodejs-22.17.0'
    }

    environment {
        NODE_ENV = 'development'
    }

    stages {
        stage('Clone Repo') {
            steps {
                git branch: 'main', url: 'https://github.com/DrunkensteinRobot/devops-node-db.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test' // Make sure you have test script in package.json
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint' // Make sure lint script exists in package.json
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build' // Optional: Ensure this script exists
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying app...'
                // Add deployment logic here
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed.'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
