/*
 * Copyright 2014 NAVER Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.navercorp.pinpoint.plugin.httpclient4.interceptor;

import com.navercorp.pinpoint.bootstrap.MetadataAccessor;
import com.navercorp.pinpoint.bootstrap.context.AsyncTraceId;
import com.navercorp.pinpoint.bootstrap.context.Trace;
import com.navercorp.pinpoint.bootstrap.context.TraceContext;
import com.navercorp.pinpoint.bootstrap.interceptor.MethodDescriptor;
import com.navercorp.pinpoint.bootstrap.interceptor.SpanAsyncEventSimpleAroundInterceptor;
import com.navercorp.pinpoint.bootstrap.plugin.annotation.Name;
import com.navercorp.pinpoint.plugin.httpclient4.HttpClient4Constants;

/**
 * 
 * @author netspider
 * @author jaehong.kim
 * 
 */
public class BasicFutureMethodInterceptor extends SpanAsyncEventSimpleAroundInterceptor implements HttpClient4Constants {

    public BasicFutureMethodInterceptor(TraceContext traceContext, MethodDescriptor methodDescriptor, @Name(METADATA_ASYNC_TRACE_ID) MetadataAccessor asyncTraceIdAccessor) {
        super(traceContext, methodDescriptor, asyncTraceIdAccessor);
    }

    @Override
    protected void doInBeforeTrace(Trace trace, AsyncTraceId asyncTraceId, Object target, Object[] args) {
        System.out.println("#################################");
        trace.markBeforeTime();
        trace.recordServiceType(HTTP_CLIENT4_INTERNAL);
    }

    @Override
    protected void doInAfterTrace(Trace trace, Object target, Object[] args, Object result, Throwable throwable) {
        trace.recordApi(methodDescriptor);
        trace.recordException(throwable);
        trace.markAfterTime();
    }
}