pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = "devops_node_app"
    }

    stages {
        stage('Checkout') {
            steps {
                // Specify the branch 'main' explicitly
                git branch: 'main', url: 'https://github.com/DrunkensteinRobot/devops-node-db.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Deploy (Compose Up)') {
            steps {
                sh 'docker compose down'
                sh 'docker compose up -d'
            }
        }
    }

    post {
        success {
            echo "✅ App deployed successfully!"
        }
        failure {
            echo "❌ Deployment failed!"
        }
    }
}
