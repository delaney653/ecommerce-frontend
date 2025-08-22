// Required steps for this pipeline:
// Each service needs a Build, Test, Security scan, Container buil
// PUsh to registry, and deploy stage

pipeline {
  agent any
  
  environment{
    VENV = 'venv'
    REGISTRY_URL = 'docker.io'
    IMAGE_NAME = 'delaney653/ecom-frontend'
    BUILD_TAG = "v1.0.$BUILD_NUMBER"
    IS_MAIN = "${env.BRANCH_NAME == 'main'}"
    DEPLOY_ENV = "${env.BRANCH_NAME.startsWith('release/') ? 'staging' : 
                      env.BRANCH_NAME == 'main' ? 'prod' : 
                      env.BRANCH_NAME == 'develop' ? 'dev' : 'build'}"
  }
  stages{
    stage('Build Stage'){
        agent any
      steps{
        checkout scm
        bat """
            docker build -t ${IMAGE_NAME}:${BUILD_TAG} -t ${IMAGE_NAME}:latest .
        """
        stash includes: 'src/**, public/**, package*.json, Dockerfile, .eslintrc.json, sonar-project.properties', name: 'code'
      }
    }
    stage('Code Linting: ESLint') {
        agent {
            label 'code-quality'
        }
        steps {
            unstash 'code'
            script {
                try {
                    bat '''
                        call npm install
                        echo Running ESLint...
                        call npx eslint src --ext .js,.jsx --format stylish --no-error-on-unmatched-pattern
                    '''
                    echo "ESLint passed with no issues!"
                } catch (Exception e) {
                    echo "ESLint found issues, but continuing pipeline..."
                    echo "ESLint output: ${e.getMessage()}"
                    currentBuild.result = 'UNSTABLE'
                }
            }
        }
    }
    stage('Parallel Check'){
        parallel{
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
            stage('Unit Tests') {
                agent any
                steps {
                    unstash 'code'
                    bat '''
                        call npm install
                        echo Running unit tests...
                        call npm run test:unit
                    '''
                }
            }
        }
    }
    stage('Integration Tests'){
        agent any
            steps {
            unstash 'code'
            bat '''
                call npm install
                echo Running unit tests...
                call npm run test:integration
            '''
            }
    }
    stage('Container Push') {
            when { 
                anyOf { 
                    branch 'develop'
                    branch 'release/*'
                    branch 'main'
                }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    bat """
                        echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                        docker push ${IMAGE_NAME}:${BUILD_TAG}
                        docker push ${IMAGE_NAME}:latest
                    """
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
             archiveArtifacts artifacts: 'reports/npm-audit-*.json', allowEmptyArchive: true
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