import { Global, Module } from '@nestjs/common';
import { YswsConfigService } from './ysws-config.service';

@Global()
@Module({
  providers: [YswsConfigService],
  exports: [YswsConfigService],
})
export class YswsConfigModule {}
