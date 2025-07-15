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
                git 'https://github.com/DrunkensteinRobot/devops-node-db.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'  // Make sure you have tests configured
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'  // if you have eslint
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build' // optional
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying app...'
                // e.g., scp, rsync, or call your deploy script
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
