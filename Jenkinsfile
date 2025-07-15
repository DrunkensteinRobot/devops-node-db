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
                bat 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npm test'
            }
        }

        stage('Lint') {
            steps {
                bat 'npm run lint'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo '✅ Deploying app...'
                // Add Docker commands or deployment logic here
            }
        }
    }

    post {
        always {
            echo '✅ Pipeline completed.'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
