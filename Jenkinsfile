// Required steps for this pipeline:
// Each service needs a Build, Test, Security scan, Container buil
// PUsh to registry, and deploy stage

pipeline {
  agent any
  
  environment{
    VENV = 'venv'
    BUILD_TAG = "v1.0.$BUILD_NUMBER"
    IS_MAIN = "${env.BRANCH_NAME == 'main'}"
  }
  stages{
    stage('Build Stage'){
        agent any
      steps{
        checkout scm
        bat "docker build -t ecom_frontend:$BUILD_NUMBER -t ecom_frontend:latest ."
        stash includes: 'src/**, public/**, package*.json, Dockerfile, .eslintrc.js, sonar-project.properties', name: 'code'
      }
    }
    stage('Code Linting: ESLint') {
        agent {
            label 'code-quality'
        }
        steps {
            unstash 'code'
            bat '''
                npm install
                npx eslint src --ext .js,.jsx --format checkstyle
            '''
        }
    }
     stage('Security Scan: SonarQube'){
            agent any
        steps {
            unstash 'code'
            script {
                scannerHome = tool 'SonarQube' 
            }
            withSonarQubeEnv('SonarQube') {
                bat "$scannerHome\\bin\\sonar-scanner.bat"
            }
        } 
    }
    // stage('Staging'){
    //     // should be done when release branch is created/updated
    //     when {
    //         branch 'release'
    //     }
    // }
    // stage('Deploy'){
    //     when {
    //         branch 'main'
    //     }
    //     // this step is done when release + main are being merged
    // }
  }    
    
    post {
        always {
            // echo 'Archiving artifacts and publishing reports...'
            
            // archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
            // archiveArtifacts artifacts: "artifacts/**", allowEmptyArchive: true
            
            // junit testResults: "reports/junit.xml", allowEmptyResults: true
            
            slackSend channel: '#new-channel', color: '#2fff00ff', message: "Build #${BUILD_NUMBER} finished with status: ${currentBuild.currentResult} (<${env.BUILD_URL}|Details>)"

            script {
                if (currentBuild.result == 'UNSTABLE') {
                    error("Too many test failures – marking pipeline as FAILED.")
                }
            }

            bat 'docker-compose down --volumes --remove-orphans || true'
            bat 'docker system prune -f || true'
        }
        failure {
            slackSend channel: '#new-channel', color: 'danger', message: " Build *#${BUILD_NUMBER}* failed! (<${env.BUILD_URL}|View Logs>)"
            echo 'Pipeline failed! Check the logs above for details.'
        }
            
        success {
            echo 'Pipeline completed successfully!'
            echo '- Build artifacts not generated'
        }
    }

}