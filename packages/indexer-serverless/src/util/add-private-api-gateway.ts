import { AWS } from '@serverless/typescript';

export function addPrivateApiGateway(
  serverlessConfiguration: AWS,
  vpcId: string,
  vpcEndpointId: string,
) {
  return {
    ...serverlessConfiguration,
    resources: {
      ...serverlessConfiguration.resources,
      Resources: {
        ...serverlessConfiguration.resources?.Resources,
        ...{
          PrivateApiGatewayRestApi: {
            Type: 'AWS::ApiGateway::RestApi',
            Properties: {
              Name: `${serverlessConfiguration.service}-${serverlessConfiguration.provider.stage}-private`,
              EndpointConfiguration: {
                Types: ['PRIVATE'],
                VpcEndpointIds: [vpcEndpointId],
              },
              Policy: {
                Version: '2012-10-17',
                Statement: [
                  {
                    Effect: 'Allow',
                    Principal: '*',
                    Action: 'execute-api:Invoke',
                    Resource: ['execute-api:/*'],
                  },
                  {
                    Effect: 'Deny',
                    Principal: '*',
                    Action: 'execute-api:Invoke',
                    Resource: ['execute-api:/*'],
                    Condition: {
                      StringNotEquals: {
                        'aws:SourceVpc': vpcId,
                      },
                    },
                  },
                ],
              },
              MinimumCompressionSize: 1024,
            },
          },
          PrivateApiGatewayResourceGraphql: {
            Type: 'AWS::ApiGateway::Resource',
            Properties: {
              ParentId: {
                'Fn::GetAtt': ['PrivateApiGatewayRestApi', 'RootResourceId'],
              },
              PathPart: 'graphql',
              RestApiId: {
                Ref: 'PrivateApiGatewayRestApi',
              },
            },
          },
          PrivateApiGatewayMethodGraphqlOptions: {
            Type: 'AWS::ApiGateway::Method',
            Properties: {
              AuthorizationType: 'NONE',
              HttpMethod: 'OPTIONS',
              MethodResponses: [
                {
                  StatusCode: '200',
                  ResponseParameters: {
                    'method.response.header.Access-Control-Allow-Origin': true,
                    'method.response.header.Access-Control-Allow-Headers': true,
                    'method.response.header.Access-Control-Allow-Methods': true,
                  },
                  ResponseModels: {},
                },
              ],
              RequestParameters: {},
              Integration: {
                Type: 'MOCK',
                RequestTemplates: {
                  'application/json': '{statusCode:200}',
                },
                ContentHandling: 'CONVERT_TO_TEXT',
                IntegrationResponses: [
                  {
                    StatusCode: '200',
                    ResponseParameters: {
                      'method.response.header.Access-Control-Allow-Origin':
                        "'*'",
                      'method.response.header.Access-Control-Allow-Headers':
                        "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
                      'method.response.header.Access-Control-Allow-Methods':
                        "'OPTIONS,POST,GET'",
                    },
                    ResponseTemplates: {
                      'application/json': '',
                    },
                  },
                ],
              },
              ResourceId: {
                Ref: 'PrivateApiGatewayResourceGraphql',
              },
              RestApiId: {
                Ref: 'PrivateApiGatewayRestApi',
              },
            },
          },
          PrivateApiGatewayMethodGraphqlGet: {
            Type: 'AWS::ApiGateway::Method',
            Properties: {
              HttpMethod: 'GET',
              RequestParameters: {},
              ResourceId: {
                Ref: 'PrivateApiGatewayResourceGraphql',
              },
              RestApiId: {
                Ref: 'PrivateApiGatewayRestApi',
              },
              ApiKeyRequired: false,
              AuthorizationType: 'NONE',
              Integration: {
                IntegrationHttpMethod: 'POST',
                Type: 'AWS_PROXY',
                Uri: {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      {
                        Ref: 'AWS::Partition',
                      },
                      ':apigateway:',
                      {
                        Ref: 'AWS::Region',
                      },
                      ':lambda:path/2015-03-31/functions/',
                      {
                        'Fn::GetAtt': ['QueryLambdaFunction', 'Arn'],
                      },
                      '/invocations',
                    ],
                  ],
                },
              },
              MethodResponses: [],
            },
            DependsOn: ['PrivateQueryLambdaPermissionApiGateway'],
          },
          PrivateApiGatewayMethodGraphqlPost: {
            Type: 'AWS::ApiGateway::Method',
            Properties: {
              HttpMethod: 'POST',
              RequestParameters: {},
              ResourceId: {
                Ref: 'PrivateApiGatewayResourceGraphql',
              },
              RestApiId: {
                Ref: 'PrivateApiGatewayRestApi',
              },
              ApiKeyRequired: false,
              AuthorizationType: 'NONE',
              Integration: {
                IntegrationHttpMethod: 'POST',
                Type: 'AWS_PROXY',
                Uri: {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      {
                        Ref: 'AWS::Partition',
                      },
                      ':apigateway:',
                      {
                        Ref: 'AWS::Region',
                      },
                      ':lambda:path/2015-03-31/functions/',
                      {
                        'Fn::GetAtt': ['QueryLambdaFunction', 'Arn'],
                      },
                      '/invocations',
                    ],
                  ],
                },
              },
              MethodResponses: [],
            },
            DependsOn: ['PrivateQueryLambdaPermissionApiGateway'],
          },
          PrivateApiGatewayDeployment1656958901360: {
            Type: 'AWS::ApiGateway::Deployment',
            Properties: {
              RestApiId: {
                Ref: 'PrivateApiGatewayRestApi',
              },
              StageName: 'test',
            },
            DependsOn: [
              'PrivateApiGatewayMethodGraphqlOptions',
              'PrivateApiGatewayMethodGraphqlGet',
              'PrivateApiGatewayMethodGraphqlPost',
            ],
          },
          PrivateQueryLambdaPermissionApiGateway: {
            Type: 'AWS::Lambda::Permission',
            Properties: {
              FunctionName: {
                'Fn::GetAtt': ['QueryLambdaFunction', 'Arn'],
              },
              Action: 'lambda:InvokeFunction',
              Principal: 'apigateway.amazonaws.com',
              SourceArn: {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    {
                      Ref: 'AWS::Partition',
                    },
                    ':execute-api:',
                    {
                      Ref: 'AWS::Region',
                    },
                    ':',
                    {
                      Ref: 'AWS::AccountId',
                    },
                    ':',
                    {
                      Ref: 'PrivateApiGatewayRestApi',
                    },
                    '/*/*',
                  ],
                ],
              },
            },
          },
        },
      },
    },
  };
}

export default addPrivateApiGateway;
