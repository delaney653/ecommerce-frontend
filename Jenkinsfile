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
        bat "docker build -t frontend:$BUILD_NUMBER -t frontend:latest ."
        stash includes: '**/*', name: 'code'
      }
    }

     stage('Static Testing: SonarQube'){
        // when {
        //     branch 'main'
        // } plz work
        agent {
            label 'any'
        }
        steps {
            unstash 'code'
            script {
                def scannerHome = tool 'SonarQube' 
            }
            withSonarQubeEnv('SonarQube') {
                bat "$scannerHome\\bin\\sonar-scanner.bat"
            }
        } 
    }
    stage("Wait for Quality Gate") {
        when {
            branch 'main'
        }
        steps {
            timeout(time: 2, unit: 'MINUTES') {
                waitForQualityGate abortPipeline: true
            }
        }
    }
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