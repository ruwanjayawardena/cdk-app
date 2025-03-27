import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export class DevStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: 2,
    });

    // ECR Repository
    const repository = new ecr.Repository(this, 'Repository');

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
    });

    // Application Load Balancer
    const alb = new elb.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true,
    });

    // Lambda Function (only in dev)
    const helloFunction = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'api-handler.main',
      environment: {
        ENV: 'dev',
      },
    });

    // API Gateway (only in dev)
    const api = new apigateway.RestApi(this, 'api', {
      restApiName: 'Hello Service',
      description: 'Development environment API',
    });

    const getIntegration = new apigateway.LambdaIntegration(helloFunction);
    api.root.addMethod('GET', getIntegration);
  }
}